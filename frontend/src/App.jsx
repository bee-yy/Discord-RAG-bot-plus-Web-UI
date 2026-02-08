// App.jsx
import { useState } from "react";
import ErrorScreen from "./components/ErrorScreen";
import SideBar from "./components/SideBar";
import ChatUI from "./components/ChatUI";
import Form from "./components/Form";
function App() {
  //
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [displayIntroState, setDisplayintroState] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    code: "",
    message: "",
  });
  const [buttonColorChange, setButtonColorChange] = useState(false);

  // API
  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userQuestion = query;

    //clear input
    setQuery("");

    try {
      console.log("loading..");
      setLoading(true);
      setButtonColorChange(true);
      const response = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userQuestion }),
      });

      //remove display intro text
      setDisplayintroState(false);
      const data = await response.json();
      if (!response.ok) {
        setError(true);
        setErrorMessage({
          code: response.status,
          message: response.statusText || data.detail || "Please retry",
        });
        console.log(data);
        return;
      }
      // set reply
      console.log(data);
      //set history
      setHistory((prevHistory) => {
        return [...prevHistory, data];
      });
    } catch (error) {
      setError(true);
      setErrorMessage({
        code: "Network",
        message: "please reload",
      });
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  async function handleReload() {
    console.log("In relaod");
    try {
      console.log("Retrying..");
      setLoading(true);
      const response = await fetch(`${API_BASE}/reload`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(true);
        if (response.status == 503) {
          setErrorMessage({
            code: response.status,
            message: "Wakig up Server",
          });
          return;
        }
        setErrorMessage({
          code: response.status,
          message: response.statusText || data.detail || "Please retry",
        });
        console.log(data);
        return;
      }
    } catch (error) {
      setError(true);
      setErrorMessage({
        code: "Network",
        message: "please reload",
      });
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry() {
    window.location.reload();
  }
  return (
    <>
      {error && (
        <ErrorScreen onReload={handleRetry} errorDescription={errorMessage} />
      )}

      <main className=" bg-black page-pad-x  text-white-primary flex flex-row h-full gap-0 text-center">
        {/*Left hand Side*/}

        <SideBar />
        {/*Right hand Side*/}
        <div className=" w-full flex flex-col justify-center items-center ">
          <div className=" flex flex-col w-[90%] md:w-[75%] h-[80%] justify-end items-center">
            {/* Title texts */}
            {displayIntroState && (
              <div className=" flex flex-col justify-end items-center gap-(--space-md) ">
                <h1 className=" w-fit m-auto text-title bg-linear-to-r from-yellow to-red text-transparent bg-clip-text ">
                  Meet Your Internship Helper
                </h1>
                <p className="text-subtitle">
                  Your go-to guide for internship questions.{" "}
                </p>
              </div>
            )}

            {/* Display responses */}
            <ChatUI history={history} onReload={handleReload} />

            {/* form */}
            <Form
              onSubmit={handleSubmit}
              loadingState={loading}
              buttonChangeState={buttonColorChange}
              query={query}
              setQuery={setQuery}
              history={history}
            />
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
