import discord
from discord.ext import commands
import logging
import aiohttp
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment
load_dotenv()
token = os.getenv('DISCORD_TOKEN')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://127.0.0.1:8000')

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('discord.log', encoding='utf-8', mode='w'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Get intents
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

# Set up bot (disable default help command)
bot = commands.Bot(command_prefix='!', intents=intents, case_insensitive=True, help_command=None)

# In-memory feedback storage (just for demo)
feedback_storage = []


@bot.event
async def on_ready():
    logger.info(f"✅ {bot.user.name} is ready!")
    logger.info(f"🔗 Backend: {BACKEND_URL}")
    
    # Test backend connection on startup
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BACKEND_URL}/health", timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Backend health check passed: {data}")
                else:
                    logger.error(f"❌ Backend health check failed: {response.status}")
    except Exception as e:
        logger.error(f"❌ Cannot connect to backend: {e}")


@bot.event
async def on_message(message):
    if message.author == bot.user:
        return
    await bot.process_commands(message)


# =============================
# Feedback View (Buttons)
# =============================
class FeedbackView(discord.ui.View):
    def __init__(self, question: str, answer: str, user_id: str, username: str):
        super().__init__(timeout=300)  # 5 minute timeout
        self.question = question
        self.answer = answer
        self.user_id = user_id
        self.username = username
        self.feedback_given = False
    
    @discord.ui.button(label="👍", style=discord.ButtonStyle.secondary)
    async def thumbs_up(self, interaction: discord.Interaction, button: discord.ui.Button):
        if self.feedback_given:
            await interaction.response.send_message("You've already provided feedback!", ephemeral=True)
            return
        
        # Store feedback locally
        feedback_entry = {
            "question": self.question,
            "answer": self.answer[:200],
            "feedback": "positive",
            "user_id": self.user_id,
            "username": self.username,
            "timestamp": datetime.utcnow().isoformat()
        }
        feedback_storage.append(feedback_entry)
        
        self.feedback_given = True
        
        # Disable both buttons
        for item in self.children:
            item.disabled = True
        
        logger.info(f"📝 Positive feedback from {self.username} ({self.user_id})")
        
        await interaction.response.send_message(
            "👍 Thanks for your feedback!",
            ephemeral=True
        )
        
        # Update message to show disabled buttons
        await interaction.message.edit(view=self)
    
    @discord.ui.button(label="👎", style=discord.ButtonStyle.secondary)
    async def thumbs_down(self, interaction: discord.Interaction, button: discord.ui.Button):
        if self.feedback_given:
            await interaction.response.send_message("You've already provided feedback!", ephemeral=True)
            return
        
        # Store feedback locally
        feedback_entry = {
            "question": self.question,
            "answer": self.answer[:200],
            "feedback": "negative",
            "user_id": self.user_id,
            "username": self.username,
            "timestamp": datetime.utcnow().isoformat()
        }
        feedback_storage.append(feedback_entry)
        
        self.feedback_given = True
        
        # Disable both buttons
        for item in self.children:
            item.disabled = True
        
        logger.info(f"📝 Negative feedback from {self.username} ({self.user_id})")
        
        await interaction.response.send_message(
            "👎 Thanks for your feedback! We'll work on improving.",
            ephemeral=True
        )
        
        # Update message to show disabled buttons
        await interaction.message.edit(view=self)


# =============================
# Helper function for asking questions
# =============================
async def query_backend(question: str, user_id: str, username: str):
    """Query the backend and return formatted response"""
    try:
        async with aiohttp.ClientSession() as session:
            logger.info(f"Sending request to: {BACKEND_URL}/ask")
            
            async with session.post(
                f"{BACKEND_URL}/ask",
                json={"question": question},
                timeout=aiohttp.ClientTimeout(total=60)
            ) as response:
                logger.info(f"Response status: {response.status}")
                
                response_text = await response.text()
                logger.info(f"Response body: {response_text[:500]}")
                
                if response.status == 200:
                    data = await response.json()
                    answer = data.get("answer", "No answer received")
                    sources = data.get("sources", [])
                    processing_time = data.get("processing_time", 0)
                    
                    # Build response message with embed
                    embed = discord.Embed(
                        title="💬 **Answer**",
                        description=answer,
                        color=discord.Color.orange()
                    )
                    
                    embed.add_field(name="❓ **Question**", value=question, inline=False)
                    
                    # Add sources if available
                    if sources:
                        sources_text = ""
                        for i, src in enumerate(sources[:3], 1):
                            doc = src.get('document', 'unknown')
                            score = src.get('score', 'N/A')
                            sources_text += f"{i}. **{doc}** (score: {score})\n"
                        embed.add_field(name="📚 **Sources**", value=sources_text, inline=False)
                    
                    embed.set_footer(text=f"⚡ Processed in {processing_time}s")
                    
                    # Create feedback buttons
                    view = FeedbackView(question, answer, user_id, username)
                    
                    return {"success": True, "embed": embed, "view": view}
                    
                elif response.status == 503:
                    return {"success": False, "message": "❌ Knowledge base not loaded. Contact admin."}
                    
                elif response.status == 500:
                    try:
                        error_data = await response.json()
                        error_msg = error_data.get('detail', 'Unknown error')
                    except:
                        error_msg = response_text[:200]
                    
                    logger.error(f"Server 500 error: {error_msg}")
                    return {"success": False, "message": f"❌ Server error: {error_msg}"}
                    
                else:
                    return {"success": False, "message": f"❌ Error: {response.status}"}
                    
    except aiohttp.ClientError as e:
        logger.error(f"Connection error: {e}")
        return {"success": False, "message": f"❌ Connection error: {str(e)}"}
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return {"success": False, "message": f"❌ Error: {str(e)}"}


# =============================
# COMMANDS
# =============================
@bot.command()
async def hello(ctx):
    """Say hello"""
    embed = discord.Embed(
        title="👋 Hello!",
        description=f"Hi there, {ctx.author.mention}!",
        color=discord.Color.orange() 
    )
    await ctx.send(embed=embed)


@bot.command()
async def ask(ctx, *, question):
    """
    Ask a question to the knowledge base
    Usage: !ask <your question>
    """
    logger.info(f"Question from {ctx.author}: {question}")
    
    async with ctx.typing():
        result = await query_backend(question, str(ctx.author.id), str(ctx.author.name))
        
        if result["success"]:
            await ctx.send(embed=result["embed"], view=result["view"])
        else:
            await ctx.send(result["message"])


@bot.command()
async def status(ctx):
    """Check backend system status"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BACKEND_URL}/health", timeout=aiohttp.ClientTimeout(total=10)) as response:
                logger.info(f"Status check: {response.status}")
                
                if response.status == 200:
                    data = await response.json()
                    
                    embed = discord.Embed(
                        title="🔧 System Status",
                        color=discord.Color.green()
                    )
                    embed.add_field(name="Groq API", value=data.get('groq_api_key', '❌'), inline=True)
                    embed.add_field(name="Knowledge Base", value=data.get('knowledge_base', '❌'), inline=True)
                    embed.add_field(name="Cached Responses", value=str(data.get('cached_responses', 0)), inline=True)
                    embed.add_field(name="LLM Model", value=data.get('llm', 'Unknown'), inline=False)
                    embed.add_field(name="Embed Model", value=data.get('embed_model', 'Unknown'), inline=False)
                    
                    await ctx.send(embed=embed)
                else:
                    await ctx.send(f"❌ Backend error: {response.status}")
                    
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        await ctx.send(f"❌ Cannot connect: {str(e)}")


@bot.command()
async def feedback(ctx):
    """Show feedback statistics"""
    if not feedback_storage:
        await ctx.send("📊 No feedback received yet!")
        return
    
    positive = sum(1 for f in feedback_storage if f["feedback"] == "positive")
    negative = sum(1 for f in feedback_storage if f["feedback"] == "negative")
    total = len(feedback_storage)
    ratio = round(positive / total * 100, 1) if total > 0 else 0
    
    embed = discord.Embed(
        title="📊 Feedback Statistics",
        description="*Local bot storage only (resets on restart)*",
        color=discord.Color.gold()
    )
    embed.add_field(name="Total Feedback", value=str(total), inline=True)
    embed.add_field(name="👍 Positive", value=str(positive), inline=True)
    embed.add_field(name="👎 Negative", value=str(negative), inline=True)
    embed.add_field(name="Success Rate", value=f"{ratio}%", inline=False)
    
    # Show recent feedback
    if feedback_storage:
        recent = feedback_storage[-3:]  # Last 3
        recent_text = ""
        for f in recent:
            emoji = "👍" if f["feedback"] == "positive" else "👎"
            recent_text += f"{emoji} {f['username']}: {f['question'][:50]}...\n"
        embed.add_field(name="Recent Feedback", value=recent_text or "None", inline=False)
    
    await ctx.send(embed=embed)


@bot.command()
async def help(ctx):
    """Show all available commands"""
    embed = discord.Embed(
        title="📖 Available Commands",
        description="Here are all the commands you can use:",
        color=discord.Color.purple()
    )
    
    embed.add_field(
        name="!ask <question>",
        value="Ask a question to the knowledge base (with feedback buttons!)",
        inline=False
    )
    embed.add_field(
        name="!status",
        value="Check backend system status",
        inline=False
    )
    embed.add_field(
        name="!feedback",
        value="View feedback statistics",
        inline=False
    )
    embed.add_field(
        name="!hello",
        value="Get a friendly greeting",
        inline=False
    )
    embed.add_field(
        name="!help",
        value="Show this command list",
        inline=False
    )
    
    await ctx.send(embed=embed)


# Run bot
if __name__ == "__main__":
    if not token:
        logger.error("❌ DISCORD_TOKEN not found in .env file!")
    else:
        logger.info(f"Starting bot with backend: {BACKEND_URL}")
        bot.run(token, log_level=logging.INFO)