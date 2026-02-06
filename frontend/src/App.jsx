// App.jsx
import { useState } from "react";
import ErrorImg from "./assets/404-error.png";
function App() {
  const [reply, setReply] = useState("");
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [displayIntroState, setDisplayintroState] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [buttonColorChange, setButtonColorChange] = useState(false);

  // Buttons
  const greenButton = (
    <span>
      <svg
        width="24"
        height="23"
        viewBox="0 0 24 23"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.16"
          d="M4.80967 1.2632L20.735 8.8072C22.7683 9.76987 22.7683 12.6632 20.735 13.6259L4.80967 21.1712C2.923 22.0645 0.786999 20.5419 1.01767 18.4672L1.791 11.5125C1.81277 11.3167 1.81277 11.119 1.791 10.9232L1.01767 3.96854C0.786999 1.89254 2.923 0.368537 4.80967 1.2632Z"
          fill="#B1FC00"
        />
        <path
          d="M1.823 11.2165L1.01767 3.96721C0.786999 1.89255 2.923 0.368548 4.80967 1.26321L20.735 8.80721C22.7683 9.76988 22.7683 12.6632 20.735 13.6259L4.80967 21.1712C2.923 22.0645 0.786999 20.5419 1.01767 18.4672L1.823 11.2165ZM1.823 11.2165H11.1563"
          stroke="#B1FC00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  const gradientButton = (
    <span>
      <svg
        width="39"
        height="32"
        viewBox="0 0 39 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.16"
          d="M11.64 6.04665L30.8431 13.5907C33.2949 14.5533 33.2949 17.4467 30.8431 18.4093L11.64 25.9546C9.36507 26.848 6.78945 25.3253 7.06759 23.2507L8.00009 16.296C8.02634 16.1001 8.02634 15.9025 8.00009 15.7066L7.06759 8.75198C6.78945 6.67598 9.36507 5.15198 11.64 6.04665Z"
          fill="url(#paint0_linear_38_90)"
        />
        <path
          d="M8.03867 16L7.06759 8.75066C6.78945 6.676 9.36507 5.15199 11.64 6.04666L30.8431 13.5907C33.2949 14.5533 33.2949 17.4467 30.8431 18.4093L11.64 25.9547C9.36507 26.848 6.78945 25.3253 7.06759 23.2507L8.03867 16ZM8.03867 16H19.293Z"
          fill="url(#paint1_linear_38_90)"
        />
        <path
          d="M8.03867 16L7.06759 8.75066C6.78945 6.676 9.36507 5.15199 11.64 6.04666L30.8431 13.5907C33.2949 14.5533 33.2949 17.4467 30.8431 18.4093L11.64 25.9547C9.36507 26.848 6.78945 25.3253 7.06759 23.2507L8.03867 16ZM8.03867 16H19.293"
          stroke="url(#paint2_linear_38_90)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <defs>
          <linearGradient
            id="paint0_linear_38_90"
            x1="7.04688"
            y1="16.0004"
            x2="32.6819"
            y2="16.0004"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#FFC403" />
            <stop offset="1" stop-color="#DD2D01" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_38_90"
            x1="7.04688"
            y1="16.0004"
            x2="32.6819"
            y2="16.0004"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#DD2D01" />
            <stop offset="1" stop-color="#FFC403" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_38_90"
            x1="7.04688"
            y1="16.0004"
            x2="32.6819"
            y2="16.0004"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#FFC403" />
            <stop offset="1" stop-color="#DD2D01" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userQuestion = query;

    //clear input
    setQuery("");

    //remove display intro text
    setDisplayintroState(false);
    try {
      console.log("loading..");
      setLoading(true);
      setButtonColorChange(true);
      const response = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userQuestion }),
      });

      const data = await response.json();
      console.log(data);
      // set reply
      setReply(data);

      //set history
      setHistory((prevHistory) => {
        return [...prevHistory, data];
      });
    } catch (error) {
      setError(true);
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  async function handleReload() {
    try {
      console.log("loading..");
      setLoading(true);
      const response = await fetch("http://localhost:8000/reload", {
        method: "POST",
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      setError(true);
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      {error && (
        <div className="h-dvh z-50  w-[90%] right-0 absolute flex flex-col justify-center items-center bg-black error">
          <div className="img-wrapper p-(--space-md) ">
            <img src={ErrorImg} alt="404 error photo" />
          </div>
          <button
            onClick={handleReload}
            className="flex  items-center justify-center inline-gap text-black w-full mr-(--space-md) bg-yellow card-pad rounded-full"
          >
            <span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.5 9C1.5 10.7902 2.21116 12.5071 3.47703 13.773C4.7429 15.0388 6.45979 15.75 8.25 15.75C10.0425 15.75 11.76 15.045 13.05 13.8L11.925 12.675C11.4528 13.175 10.883 13.5728 10.2509 13.8437C9.61876 14.1147 8.93774 14.2529 8.25 14.25C3.57 14.25 1.23 8.595 4.5375 5.2875C7.845 1.98 13.5 4.3275 13.5 9H11.25L14.25 12H14.325L17.25 9H15C15 7.20979 14.2888 5.4929 13.023 4.22703C11.7571 2.96116 10.0402 2.25 8.25 2.25C6.45979 2.25 4.7429 2.96116 3.47703 4.22703C2.21116 5.4929 1.5 7.20979 1.5 9Z"
                  fill="currentColor"
                />
              </svg>
            </span>{" "}
            Retry{" "}
          </button>
        </div>
      )}

      <main className=" bg-black page-pad-x  text-white-primary flex flex-row h-full gap-0 text-center">
        {/*Left hand Side*/}
        <aside className="side-bar-w h-dvh flex flex-col justify-between ">
          {/* top icons */}
          <div className="top flex flex-col gap-(--space-sm) pt-(--page-pad-y)">
            <span className="icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g filter="url(#filter0_dd_36_4)">
                  <path
                    d="M9 3.5V20.5M3 9.4C3 7.16 3 6.04 3.436 5.184C3.81949 4.43139 4.43139 3.81949 5.184 3.436C6.04 3 7.16 3 9.4 3H14.6C16.84 3 17.96 3 18.816 3.436C19.5686 3.81949 20.1805 4.43139 20.564 5.184C21 6.04 21 7.16 21 9.4V14.6C21 16.84 21 17.96 20.564 18.816C20.1805 19.5686 19.5686 20.1805 18.816 20.564C17.96 21 16.84 21 14.6 21H9.4C7.16 21 6.04 21 5.184 20.564C4.43139 20.1805 3.81949 19.5686 3.436 18.816C3 17.96 3 16.84 3 14.6V9.4Z"
                    stroke="url(#paint0_linear_36_4)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <filter
                    id="filter0_dd_36_4"
                    x="-15.75"
                    y="-7.75"
                    width="55.5"
                    height="55.5"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_36_4"
                    />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feMorphology
                      radius="6"
                      operator="dilate"
                      in="SourceAlpha"
                      result="effect2_dropShadow_36_4"
                    />
                    <feOffset dy="8" />
                    <feGaussianBlur stdDeviation="6" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="effect1_dropShadow_36_4"
                      result="effect2_dropShadow_36_4"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect2_dropShadow_36_4"
                      result="shape"
                    />
                  </filter>
                  <linearGradient
                    id="paint0_linear_36_4"
                    x1="3"
                    y1="12"
                    x2="21"
                    y2="12"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFC403" />
                    <stop offset="1" stopColor="#DD2D01" />
                  </linearGradient>
                </defs>
              </svg>
            </span>

            <span className="icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_36_5)">
                  <g filter="url(#filter0_dd_36_5)">
                    <path
                      d="M6 17L3.85 19.15C3.68333 19.3167 3.5 19.3583 3.3 19.275C3.1 19.1917 3 19.0333 3 18.8V5C3 4.45 3.196 3.97933 3.588 3.588C3.98 3.19667 4.45067 3.00067 5 3H17C17.55 3 18.021 3.196 18.413 3.588C18.805 3.98 19.0007 4.45067 19 5V9.025C19 9.30833 18.904 9.54167 18.712 9.725C18.52 9.90833 18.2827 10 18 10C17.7173 10 17.48 9.904 17.288 9.712C17.096 9.52 17 9.28267 17 9V5H5V15H11C11.2833 15 11.521 15.096 11.713 15.288C11.905 15.48 12.0007 15.7173 12 16C11.9993 16.2827 11.9033 16.5203 11.712 16.713C11.5207 16.9057 11.2833 17.0013 11 17H6ZM8 9H14C14.2833 9 14.521 8.904 14.713 8.712C14.905 8.52 15.0007 8.28267 15 8C14.9993 7.71733 14.9033 7.48 14.712 7.288C14.5207 7.096 14.2833 7 14 7H8C7.71667 7 7.47933 7.096 7.288 7.288C7.09667 7.48 7.00067 7.71733 7 8C6.99933 8.28267 7.09533 8.52033 7.288 8.713C7.48067 8.90567 7.718 9.00133 8 9ZM8 13H11C11.2833 13 11.521 12.904 11.713 12.712C11.905 12.52 12.0007 12.2827 12 12C11.9993 11.7173 11.9033 11.48 11.712 11.288C11.5207 11.096 11.2833 11 11 11H8C7.71667 11 7.47933 11.096 7.288 11.288C7.09667 11.48 7.00067 11.7173 7 12C6.99933 12.2827 7.09533 12.5203 7.288 12.713C7.48067 12.9057 7.718 13.0013 8 13ZM17 17H15C14.7167 17 14.4793 16.904 14.288 16.712C14.0967 16.52 14.0007 16.2827 14 16C13.9993 15.7173 14.0953 15.48 14.288 15.288C14.4807 15.096 14.718 15 15 15H17V13C17 12.7167 17.096 12.4793 17.288 12.288C17.48 12.0967 17.7173 12.0007 18 12C18.2827 11.9993 18.5203 12.0953 18.713 12.288C18.9057 12.4807 19.0013 12.718 19 13V15H21C21.2833 15 21.521 15.096 21.713 15.288C21.905 15.48 22.0007 15.7173 22 16C21.9993 16.2827 21.9033 16.5203 21.712 16.713C21.5207 16.9057 21.2833 17.0013 21 17H19V19C19 19.2833 18.904 19.521 18.712 19.713C18.52 19.905 18.2827 20.0007 18 20C17.7173 19.9993 17.48 19.9033 17.288 19.712C17.096 19.5207 17 19.2833 17 19V17Z"
                      fill="url(#paint0_linear_36_5)"
                    />
                  </g>
                </g>
                <defs>
                  <filter
                    id="filter0_dd_36_5"
                    x="-15"
                    y="-7"
                    width="55"
                    height="53"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_36_5"
                    />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feMorphology
                      radius="6"
                      operator="dilate"
                      in="SourceAlpha"
                      result="effect2_dropShadow_36_5"
                    />
                    <feOffset dy="8" />
                    <feGaussianBlur stdDeviation="6" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="effect1_dropShadow_36_5"
                      result="effect2_dropShadow_36_5"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect2_dropShadow_36_5"
                      result="shape"
                    />
                  </filter>
                  <linearGradient
                    id="paint0_linear_36_5"
                    x1="3"
                    y1="11.5"
                    x2="22"
                    y2="11.5"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFC403" />
                    <stop offset="1" stopColor="#DD2D01" />
                  </linearGradient>
                  <clipPath id="clip0_36_5">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>

            <span className="icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_36_7)">
                  <g filter="url(#filter0_dd_36_7)">
                    <path
                      d="M10.825 22C10.375 22 9.98765 21.85 9.66298 21.55C9.33831 21.25 9.14231 20.8833 9.07498 20.45L8.84998 18.8C8.63331 18.7167 8.42931 18.6167 8.23798 18.5C8.04665 18.3833 7.85898 18.2583 7.67498 18.125L6.12498 18.775C5.70831 18.9583 5.29165 18.975 4.87498 18.825C4.45831 18.675 4.13331 18.4083 3.89998 18.025L2.72498 15.975C2.49165 15.5917 2.42498 15.1833 2.52498 14.75C2.62498 14.3167 2.84998 13.9583 3.19998 13.675L4.52498 12.675C4.50831 12.5583 4.49998 12.4457 4.49998 12.337V11.662C4.49998 11.554 4.50831 11.4417 4.52498 11.325L3.19998 10.325C2.84998 10.0417 2.62498 9.68333 2.52498 9.25C2.42498 8.81667 2.49165 8.40833 2.72498 8.025L3.89998 5.975C4.13331 5.59167 4.45831 5.325 4.87498 5.175C5.29165 5.025 5.70831 5.04167 6.12498 5.225L7.67498 5.875C7.85831 5.74167 8.04998 5.61667 8.24998 5.5C8.44998 5.38333 8.64998 5.28333 8.84998 5.2L9.07498 3.55C9.14165 3.11667 9.33765 2.75 9.66298 2.45C9.98831 2.15 10.3756 2 10.825 2H13.175C13.625 2 14.0126 2.15 14.338 2.45C14.6633 2.75 14.859 3.11667 14.925 3.55L15.15 5.2C15.3666 5.28333 15.571 5.38333 15.763 5.5C15.955 5.61667 16.1423 5.74167 16.325 5.875L17.875 5.225C18.2916 5.04167 18.7083 5.025 19.125 5.175C19.5416 5.325 19.8666 5.59167 20.1 5.975L21.275 8.025C21.5083 8.40833 21.575 8.81667 21.475 9.25C21.375 9.68333 21.15 10.0417 20.8 10.325L19.475 11.325C19.4916 11.4417 19.5 11.5543 19.5 11.663V12.337C19.5 12.4457 19.4833 12.5583 19.45 12.675L20.775 13.675C21.125 13.9583 21.35 14.3167 21.45 14.75C21.55 15.1833 21.4833 15.5917 21.25 15.975L20.05 18.025C19.8166 18.4083 19.4916 18.675 19.075 18.825C18.6583 18.975 18.2416 18.9583 17.825 18.775L16.325 18.125C16.1416 18.2583 15.95 18.3833 15.75 18.5C15.55 18.6167 15.35 18.7167 15.15 18.8L14.925 20.45C14.8583 20.8833 14.6626 21.25 14.338 21.55C14.0133 21.85 13.6256 22 13.175 22H10.825ZM11 20H12.975L13.325 17.35C13.8416 17.2167 14.321 17.021 14.763 16.763C15.205 16.505 15.609 16.1923 15.975 15.825L18.45 16.85L19.425 15.15L17.275 13.525C17.3583 13.2917 17.4166 13.046 17.45 12.788C17.4833 12.53 17.5 12.2673 17.5 12C17.5 11.7327 17.4833 11.4703 17.45 11.213C17.4166 10.9557 17.3583 10.7097 17.275 10.475L19.425 8.85L18.45 7.15L15.975 8.2C15.6083 7.81667 15.2043 7.496 14.763 7.238C14.3216 6.98 13.8423 6.784 13.325 6.65L13 4H11.025L10.675 6.65C10.1583 6.78333 9.67931 6.97933 9.23798 7.238C8.79665 7.49667 8.39231 7.809 8.02498 8.175L5.54998 7.15L4.57498 8.85L6.72498 10.45C6.64165 10.7 6.58331 10.95 6.54998 11.2C6.51665 11.45 6.49998 11.7167 6.49998 12C6.49998 12.2667 6.51665 12.525 6.54998 12.775C6.58331 13.025 6.64165 13.275 6.72498 13.525L4.57498 15.15L5.54998 16.85L8.02498 15.8C8.39165 16.1833 8.79598 16.5043 9.23798 16.763C9.67998 17.0217 10.159 17.2173 10.675 17.35L11 20ZM12.05 15.5C13.0166 15.5 13.8416 15.1583 14.525 14.475C15.2083 13.7917 15.55 12.9667 15.55 12C15.55 11.0333 15.2083 10.2083 14.525 9.525C13.8416 8.84167 13.0166 8.5 12.05 8.5C11.0666 8.5 10.2376 8.84167 9.56298 9.525C8.88831 10.2083 8.55065 11.0333 8.54998 12C8.54931 12.9667 8.88698 13.7917 9.56298 14.475C10.239 15.1583 11.068 15.5 12.05 15.5Z"
                      fill="url(#paint0_linear_36_7)"
                    />
                  </g>
                </g>
                <defs>
                  <filter
                    id="filter0_dd_36_7"
                    x="-15.52"
                    y="-8"
                    width="55.04"
                    height="56"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_36_7"
                    />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feMorphology
                      radius="6"
                      operator="dilate"
                      in="SourceAlpha"
                      result="effect2_dropShadow_36_7"
                    />
                    <feOffset dy="8" />
                    <feGaussianBlur stdDeviation="6" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="effect1_dropShadow_36_7"
                      result="effect2_dropShadow_36_7"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect2_dropShadow_36_7"
                      result="shape"
                    />
                  </filter>
                  <linearGradient
                    id="paint0_linear_36_7"
                    x1="2.47998"
                    y1="12"
                    x2="21.52"
                    y2="12"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFC403" />
                    <stop offset="1" stopColor="#DD2D01" />
                  </linearGradient>
                  <clipPath id="clip0_36_7">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
          </div>

          {/* botton icons */}
          <div className="bottom  pb-(--page-pad-y)">
            <span className="icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 0C8.68678 0 7.38642 0.258658 6.17317 0.761205C4.95991 1.26375 3.85752 2.00035 2.92893 2.92893C1.05357 4.8043 0 7.34784 0 10C0 12.6522 1.05357 15.1957 2.92893 17.0711C3.85752 17.9997 4.95991 18.7362 6.17317 19.2388C7.38642 19.7413 8.68678 20 10 20C12.6522 20 15.1957 18.9464 17.0711 17.0711C18.9464 15.1957 20 12.6522 20 10C20 8.68678 19.7413 7.38642 19.2388 6.17317C18.7362 4.95991 17.9997 3.85752 17.0711 2.92893C16.1425 2.00035 15.0401 1.26375 13.8268 0.761205C12.6136 0.258658 11.3132 0 10 0ZM5.07 16.28C5.5 15.38 8.12 14.5 10 14.5C11.88 14.5 14.5 15.38 14.93 16.28C13.5291 17.3955 11.7908 18.002 10 18C8.14 18 6.43 17.36 5.07 16.28ZM16.36 14.83C14.93 13.09 11.46 12.5 10 12.5C8.54 12.5 5.07 13.09 3.64 14.83C2.57632 13.4446 1.99982 11.7467 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 11.82 17.38 13.5 16.36 14.83ZM10 4C8.06 4 6.5 5.56 6.5 7.5C6.5 9.44 8.06 11 10 11C11.94 11 13.5 9.44 13.5 7.5C13.5 5.56 11.94 4 10 4ZM10 9C9.60218 9 9.22064 8.84196 8.93934 8.56066C8.65804 8.27936 8.5 7.89782 8.5 7.5C8.5 7.10218 8.65804 6.72064 8.93934 6.43934C9.22064 6.15804 9.60218 6 10 6C10.3978 6 10.7794 6.15804 11.0607 6.43934C11.342 6.72064 11.5 7.10218 11.5 7.5C11.5 7.89782 11.342 8.27936 11.0607 8.56066C10.7794 8.84196 10.3978 9 10 9Z"
                  fill="url(#paint0_linear_36_10)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_36_10"
                    x1="0"
                    y1="10"
                    x2="20"
                    y2="10"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFC403" />
                    <stop offset="1" stopColor="#DD2D01" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </div>
        </aside>

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
            <div className="overflow-y-auto w-full text-white-secondary ">
              {history.map((item, index) => {
                return (
                  <div key={index}>
                    <h4
                      className={`  bg-yellow text-black p-(--space-sm) w-fit ml-auto rounded-4xl text-right ${index == 0 ? "mt-0" : "mt-(--space-xl)"}  mb-(--space-lg)`}
                    >
                      {" "}
                      {item.question}
                    </h4>
                    <p className="gradient-border-top-box py-(--space-lg)  text-left ">
                      {" "}
                      {item.answer}
                    </p>

                    {item.sources.map((source, sourceIndex) => {
                      return (
                        <p
                          className="text-secondary opacity-70 italic underline text-left text-caption mb-(--space-xs)"
                          key={sourceIndex}
                        >
                          {source.document}{" "}
                        </p>
                      );
                    })}

                    <div className=" flex w-full gap-(--space-sm)  mt-(--space-sm) feedback">
                      <span className="thumbs-up">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.75 6.75V15.75H0.75V6.75H3.75ZM6.75 15.75C6.35218 15.75 5.97064 15.592 5.68934 15.3107C5.40804 15.0294 5.25 14.6478 5.25 14.25V6.75C5.25 6.3375 5.415 5.9625 5.6925 5.6925L10.6275 0.75L11.4225 1.545C11.625 1.7475 11.7525 2.025 11.7525 2.3325L11.73 2.5725L11.0175 6H15.75C16.1478 6 16.5294 6.15804 16.8107 6.43934C17.092 6.72064 17.25 7.10217 17.25 7.5V9C17.25 9.195 17.2125 9.375 17.145 9.5475L14.88 14.835C14.655 15.375 14.1225 15.75 13.5 15.75H6.75ZM6.75 14.25H13.5225L15.75 9V7.5H9.1575L10.005 3.51L6.75 6.7725V14.25Z"
                            fill="#FFC403"
                          />
                        </svg>
                      </span>
                      <span className="thumbs-down">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14.25 11.25V2.25H17.25V11.25H14.25ZM11.25 2.25C11.6478 2.25 12.0294 2.40804 12.3107 2.68934C12.592 2.97064 12.75 3.35218 12.75 3.75V11.25C12.75 11.6625 12.585 12.0375 12.3075 12.3075L7.3725 17.25L6.5775 16.455C6.375 16.2525 6.2475 15.975 6.2475 15.66L6.27 15.4275L6.9825 12H2.25C1.85218 12 1.47064 11.842 1.18934 11.5607C0.908035 11.2794 0.75 10.8978 0.75 10.5V9C0.75 8.805 0.7875 8.625 0.855 8.4525L3.12 3.165C3.345 2.625 3.8775 2.25 4.5 2.25H11.25ZM11.25 3.75H4.4775L2.25 9V10.5H8.835L7.9875 14.49L11.25 11.2275V3.75Z"
                            fill="#FFC403"
                          />
                        </svg>
                      </span>
                      <span className="thumps-retry">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1.5 9C1.5 10.7902 2.21116 12.5071 3.47703 13.773C4.7429 15.0388 6.45979 15.75 8.25 15.75C10.0425 15.75 11.76 15.045 13.05 13.8L11.925 12.675C11.4528 13.175 10.883 13.5728 10.2509 13.8437C9.61876 14.1147 8.93774 14.2529 8.25 14.25C3.57 14.25 1.23 8.595 4.5375 5.2875C7.845 1.98 13.5 4.3275 13.5 9H11.25L14.25 12H14.325L17.25 9H15C15 7.20979 14.2888 5.4929 13.023 4.22703C11.7571 2.96116 10.0402 2.25 8.25 2.25C6.45979 2.25 4.7429 2.96116 3.47703 4.22703C2.21116 5.4929 1.5 7.20979 1.5 9Z"
                            fill="#FFC403"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* form */}
            <form
              className={`gradient-border-box w-full relative flex ${history.length > 0 ? "mt-(--space-xl)" : "mt-100"}  px-(--space-sm)  input-h rounded-xl md:rounded-2xl`}
              onSubmit={handleSubmit}
            >
              {loading && (
                <p className="absolute top-[-100%] animate-pulse">
                  {" "}
                  Thinking ...
                </p>
              )}{" "}
              <label htmlFor="query"></label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className=" w-full h-full outline-0 rounded-md p-2"
                type="text"
                placeholder="ask a question"
              />
              <button className="" type="submit">
                {!buttonColorChange && greenButton}
                {buttonColorChange && gradientButton}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
