import Tooltip from "@mui/material/Tooltip";
function cleanAnswer(answer) {
  return typeof answer === "string"
    ? answer.trim().replace(/\r\n/g, "\n")
    : "";
}




function ChatUI(props) {
  return (
    <div className="overflow-y-auto w-full text-white-secondary ">
      {props.history.map((item, index) => {
        return (
          <div key={index}>
            <h4
              className={`  bg-yellow text-black p-(--space-sm) w-fit ml-auto rounded-4xl text-right ${index == 0 ? "mt-0" : "mt-(--space-xl)"}  mb-(--space-lg)`}
            >
              {" "}
              {item.question}
            </h4>
            <div className="gradient-border-top-box py-(--space-lg)  text-left ">
              {" "}
              {item.answer}
            </div>

            {/* {(item.sources || []).map((source, sourceIndex) => {
                      return (
                        <p
                          className="text-secondary opacity-70 italic underline text-left text-caption mb-(--space-xs)"
                          key={sourceIndex}
                        >
                          {source.document}{" "}
                        </p>
                      );
                    })} */}

            <div className=" flex justify-between items-center opacity-70">
              <div className="text-secondary opacity-70 italic underline text-left text-body mb-(--space-xs) cursor-pointer">
                <Tooltip
                  placement="bottom"
                  title={
                    <div>
                      {(item.sources || []).map((source, sourceIndex) => (
                        <div key={sourceIndex}>• {source.document}</div>
                      ))}
                    </div>
                  }
                >
                  <p>Sources</p>
                </Tooltip>
              </div>

              <div className="flex gap-(--space-sm)  feedback">
                <Tooltip title="like">
                  <span 
                  className="thumbs-up">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.75 6.75V15.75H0.75V6.75H3.75ZM6.75 15.75C6.35218 15.75 5.97064 15.592 5.68934 15.3107C5.40804 15.0294 5.25 14.6478 5.25 14.25V6.75C5.25 6.3375 5.415 5.9625 5.6925 5.6925L10.6275 0.75L11.4225 1.545C11.625 1.7475 11.7525 2.025 11.7525 2.3325L11.73 2.5725L11.0175 6H15.75C16.1478 6 16.5294 6.15804 16.8107 6.43934C17.092 6.72064 17.25 7.10217 17.25 7.5V9C17.25 9.195 17.2125 9.375 17.145 9.5475L14.88 14.835C14.655 15.375 14.1225 15.75 13.5 15.75H6.75ZM6.75 14.25H13.5225L15.75 9V7.5H9.1575L10.005 3.51L6.75 6.7725V14.25Z"
                        fill="#f1f2f2"
                      />
                    </svg>
                  </span>
                </Tooltip>

                <Tooltip title="dislike"
                >
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
                        fill="#f1f2f2"
                      />
                    </svg>
                  </span>
                </Tooltip>

                <Tooltip
                title="retry"
                >
                  <span onClick={props.onReload} className="thumps-retry">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.5 9C1.5 10.7902 2.21116 12.5071 3.47703 13.773C4.7429 15.0388 6.45979 15.75 8.25 15.75C10.0425 15.75 11.76 15.045 13.05 13.8L11.925 12.675C11.4528 13.175 10.883 13.5728 10.2509 13.8437C9.61876 14.1147 8.93774 14.2529 8.25 14.25C3.57 14.25 1.23 8.595 4.5375 5.2875C7.845 1.98 13.5 4.3275 13.5 9H11.25L14.25 12H14.325L17.25 9H15C15 7.20979 14.2888 5.4929 13.023 4.22703C11.7571 2.96116 10.0402 2.25 8.25 2.25C6.45979 2.25 4.7429 2.96116 3.47703 4.22703C2.21116 5.4929 1.5 7.20979 1.5 9Z"
                        fill="#f1f2f2"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChatUI;
