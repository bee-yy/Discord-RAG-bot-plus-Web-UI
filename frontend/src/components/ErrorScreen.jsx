

import ErrorImg from "../assets/error-img.png";

function ErrorScreen(props){

return(<>
  <div className="h-dvh z-50  w-[90%] right-0 absolute flex flex-col justify-center items-center bg-black error">
          <div className="w-[70%] flex flex-col gap-(--space-xl) items-center">
            <div className="img-wrapper p-(--space-md) ">
            <p className="text-red  text-5xl  font-bold text-center">
              {props.errorDescription.code} Error </p>
              <p className="text-white-primary"><span className="text-4xl" >W</span>hoops Something went wrong</p>
             
            {/* <img src={ErrorImg} alt="404 error photo" /> */}
            <p className="text-white-secondary text-center">
              {/* {props.errorDescription.message} */}
            </p>
          </div>
          <button
            onClick={props.onReload}
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
        </div>

</>)

}


export default ErrorScreen;