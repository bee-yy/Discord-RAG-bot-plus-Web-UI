import os
import asyncio
import logging
from datetime import datetime

import discord
from discord.ext import commands
import aiohttp
from aiohttp import web
from dotenv import load_dotenv

# Load environment (local dev). On Koyeb, env vars come from the dashboard.
load_dotenv()

TOKEN = os.getenv("DISCORD_TOKEN")
BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")

# -----------------------------
# Tiny web server for Koyeb
# -----------------------------
async def handle_health(request):
    return web.Response(text="ok")

async def start_web_server():
    app = web.Application()
    app.router.add_get("/", handle_health)

    runner = web.AppRunner(app)
    await runner.setup()

    port = int(os.getenv("PORT", "8000"))
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()

# -----------------------------
# Logging (console only)
# -----------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# -----------------------------
# Discord bot setup
# -----------------------------
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(
    command_prefix="!",
    intents=intents,
    case_insensitive=True,
    help_command=None,
)

# In-memory feedback storage (resets on restart)
feedback_storage = []

@bot.event
async def on_ready():
    logger.info(f"✅ {bot.user.name} is ready!")
    logger.info(f"🔗 Backend: {BACKEND_URL}")

    # Test backend connection on startup
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_URL}/health",
                timeout=aiohttp.ClientTimeout(total=5),
            ) as response:
                if response.status == 200:
                    try:
                        data = await response.json()
                    except Exception:
                        data = await response.text()
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

# -----------------------------
# Feedback View (Buttons)
# -----------------------------
class FeedbackView(discord.ui.View):
    def __init__(self, question: str, answer: str, user_id: str, username: str):
        super().__init__(timeout=300)  # 5 minutes
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

        feedback_entry = {
            "question": self.question,
            "answer": self.answer[:200],
            "feedback": "positive",
            "user_id": self.user_id,
            "username": self.username,
            "timestamp": datetime.utcnow().isoformat(),
        }
        feedback_storage.append(feedback_entry)

        self.feedback_given = True
        for item in self.children:
            item.disabled = True

        logger.info(f"📝 Positive feedback from {self.username} ({self.user_id})")

        await interaction.response.send_message("👍 Thanks for your feedback!", ephemeral=True)
        await interaction.message.edit(view=self)

    @discord.ui.button(label="👎", style=discord.ButtonStyle.secondary)
    async def thumbs_down(self, interaction: discord.Interaction, button: discord.ui.Button):
        if self.feedback_given:
            await interaction.response.send_message("You've already provided feedback!", ephemeral=True)
            return

        feedback_entry = {
            "question": self.question,
            "answer": self.answer[:200],
            "feedback": "negative",
            "user_id": self.user_id,
            "username": self.username,
            "timestamp": datetime.utcnow().isoformat(),
        }
        feedback_storage.append(feedback_entry)

        self.feedback_given = True
        for item in self.children:
            item.disabled = True

        logger.info(f"📝 Negative feedback from {self.username} ({self.user_id})")

        await interaction.response.send_message("👎 Thanks for your feedback! We'll improve.", ephemeral=True)
        await interaction.message.edit(view=self)

# -----------------------------
# Backend query helper
# -----------------------------
async def query_backend(question: str, user_id: str, username: str):
    try:
        async with aiohttp.ClientSession() as session:
            logger.info(f"Sending request to: {BACKEND_URL}/ask")

            async with session.post(
                f"{BACKEND_URL}/ask",
                json={"question": question},
                timeout=aiohttp.ClientTimeout(total=60),
            ) as response:
                logger.info(f"Response status: {response.status}")

                response_text = await response.text()
                logger.info(f"Response body: {response_text[:500]}")

                if response.status == 200:
                    data = await response.json()
                    answer = data.get("answer", "No answer received")
                    sources = data.get("sources", [])
                    processing_time = data.get("processing_time", 0)

                    embed = discord.Embed(
                        title="💬 Answer",
                        description=answer,
                        color=discord.Color.orange(),
                    )
                    embed.add_field(name="❓ Question", value=question, inline=False)

                    if sources:
                        sources_text = ""
                        for i, src in enumerate(sources[:3], 1):
                            doc = src.get("document", "unknown")
                            score = src.get("score", "N/A")
                            sources_text += f"{i}. **{doc}** (score: {score})\n"
                        embed.add_field(name="📚 Sources", value=sources_text, inline=False)

                    embed.set_footer(text=f"⚡ Processed in {processing_time}s")

                    view = FeedbackView(question, answer, user_id, username)
                    return {"success": True, "embed": embed, "view": view}

                if response.status == 503:
                    return {"success": False, "message": "❌ Knowledge base not loaded. Contact admin."}

                if response.status == 500:
                    try:
                        error_data = await response.json()
                        error_msg = error_data.get("detail", "Unknown error")
                    except Exception:
                        error_msg = response_text[:200]

                    logger.error(f"Server 500 error: {error_msg}")
                    return {"success": False, "message": f"❌ Server error: {error_msg}"}

                return {"success": False, "message": f"❌ Error: {response.status}"}

    except aiohttp.ClientError as e:
        logger.error(f"Connection error: {e}")
        return {"success": False, "message": f"❌ Connection error: {str(e)}"}
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return {"success": False, "message": f"❌ Error: {str(e)}"}

# -----------------------------
# Commands
# -----------------------------
@bot.command()
async def hello(ctx):
    embed = discord.Embed(
        title="👋 Hello!",
        description=f"Hi there, {ctx.author.mention}!",
        color=discord.Color.orange(),
    )
    await ctx.send(embed=embed)

@bot.command()
async def ask(ctx, *, question):
    logger.info(f"Question from {ctx.author}: {question}")

    async with ctx.typing():
        result = await query_backend(question, str(ctx.author.id), str(ctx.author.name))
        if result["success"]:
            await ctx.send(embed=result["embed"], view=result["view"])
        else:
            await ctx.send(result["message"])

@bot.command()
async def status(ctx):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_URL}/health",
                timeout=aiohttp.ClientTimeout(total=10),
            ) as response:
                logger.info(f"Status check: {response.status}")

                if response.status == 200:
                    data = await response.json()

                    embed = discord.Embed(title="🔧 System Status", color=discord.Color.green())
                    embed.add_field(name="Groq API", value=data.get("groq_api_key", "❌"), inline=True)
                    embed.add_field(name="Knowledge Base", value=data.get("knowledge_base", "❌"), inline=True)
                    embed.add_field(name="Cached Responses", value=str(data.get("cached_responses", 0)), inline=True)
                    embed.add_field(name="LLM Model", value=data.get("llm", "Unknown"), inline=False)
                    embed.add_field(name="Embed Model", value=data.get("embed_model", "Unknown"), inline=False)

                    await ctx.send(embed=embed)
                else:
                    await ctx.send(f"❌ Backend error: {response.status}")

    except Exception as e:
        logger.error(f"Status check failed: {e}")
        await ctx.send(f"❌ Cannot connect: {str(e)}")

@bot.command()
async def feedback(ctx):
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
        color=discord.Color.gold(),
    )
    embed.add_field(name="Total Feedback", value=str(total), inline=True)
    embed.add_field(name="👍 Positive", value=str(positive), inline=True)
    embed.add_field(name="👎 Negative", value=str(negative), inline=True)
    embed.add_field(name="Success Rate", value=f"{ratio}%", inline=False)

    recent = feedback_storage[-3:]
    recent_text = ""
    for f in recent:
        emoji = "👍" if f["feedback"] == "positive" else "👎"
        recent_text += f"{emoji} {f['username']}: {f['question'][:50]}...\n"

    if recent_text:
        embed.add_field(name="Recent Feedback", value=recent_text, inline=False)

    await ctx.send(embed=embed)

@bot.command()
async def help(ctx):
    embed = discord.Embed(
        title="📖 Available Commands",
        description="Here are all the commands you can use:",
        color=discord.Color.purple(),
    )
    embed.add_field(name="!ask <question>", value="Ask the knowledge base (with feedback buttons)", inline=False)
    embed.add_field(name="!status", value="Check backend system status", inline=False)
    embed.add_field(name="!feedback", value="View feedback stats", inline=False)
    embed.add_field(name="!hello", value="Get a greeting", inline=False)
    embed.add_field(name="!help", value="Show this command list", inline=False)
    await ctx.send(embed=embed)

# -----------------------------
# Start both: web server + bot
# -----------------------------
async def main():
    if not TOKEN:
        logger.error("❌ DISCORD_TOKEN is missing. Set it in Koyeb env vars (or .env locally).")
        return

    await start_web_server()
    await bot.start(TOKEN)

if __name__ == "__main__":
    asyncio.run(main())
