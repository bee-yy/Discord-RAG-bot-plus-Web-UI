// Buttons


function Form(props){
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
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
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
            <stop stopColor="#FFC403" />
            <stop offset="1" stopColor="#DD2D01" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_38_90"
            x1="7.04688"
            y1="16.0004"
            x2="32.6819"
            y2="16.0004"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#DD2D01" />
            <stop offset="1" stopColor="#FFC403" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_38_90"
            x1="7.04688"
            y1="16.0004"
            x2="32.6819"
            y2="16.0004"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFC403" />
            <stop offset="1" stopColor="#DD2D01" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
return(
   <form
       className={`border-2 border-amber-50 gradient-border-box w-full relative flex ${props.history.length > 0 ? "mt-(--space-xl)" : "mt-100"}  px-(--space-sm)  input-h rounded-xl md:rounded-2xl`}
              onSubmit={props.onSubmit}>
              {props.loadingState && (
                <p className="absolute bottom-full animate-pulse text-caption mb-(--space-xs)">Thinking ...
                </p>
              )}{" "}
              <label htmlFor="query"></label>
              <input
                value={props.query}
                onChange={(e) => props.setQuery(e.target.value)}
                className=" w-full h-full outline-0 rounded-md p-2"
                type="text"
                placeholder="ask a question"
              />
              <button className="" type="submit">
                {!props.buttonChangeState && greenButton}
                {props.buttonChangeState && gradientButton}
              </button>
            </form>
)
}


export default Form;