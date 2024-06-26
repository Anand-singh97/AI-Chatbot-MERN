import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import galaxySmall from "../assets/galaxy-small.jpg";
import galaxy from "../assets/galaxy.jpg";
import BlurImage from "../components/BlurImage";
import ShowAlert from "../components/ShowAlert";
import { loginUser } from "../helpers/api-communicator";
import { loginValidation } from "../helpers/validation";
import { isAlertAtom, showAlertAtom } from "../store/alert-atoms";
import { currentUserAtom, isLoggedInAtom } from "../store/user-info-atom";
import { LoginUserType, alertType, errorMessageType } from "../types";

export const Login = () => {
  const [errors, setErrors] = useState<errorMessageType>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [currentAlert, setCurrentAlert] = useRecoilState(showAlertAtom);
  const [isAlert, setIsAlert] = useRecoilState(isAlertAtom);
  const [credentials, setCredentials] = useState<LoginUserType>({
    email: "",
    password: "",
  });
  const fillGuestCredentials = async () => {
    setIsGuest(true);
    setCredentials({
      email: process.env.REACT_APP_GUEST_EMAIL!,
      password: process.env.REACT_APP_GUEST_PASSWORD!,
    });
  };
  const { password, email } = credentials;
  const setCurrentUserAtom = useSetRecoilState(currentUserAtom);
  const setIsLoggedIn = useSetRecoilState(isLoggedInAtom);
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors([{}]);
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setIsAlert(false);
  };

  const submitLoginForm = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) {
        e.preventDefault();
      }
      const result = loginValidation({ email, password });
      if (result.length !== 0) {
        setErrors(result);
      } else {
        const data = await loginUser(email, password);
        if (data && data.status === 200) {
          setCurrentUserAtom({ name: data.name, email: data.email });
          setIsLoggedIn(true);
          navigate("/chat");
        } else {
          setIsAlert(true);
          const time = Date.now();
          setCurrentAlert({
            message: data.message,
            page: "login",
            severity: alertType.error,
            timestamp: time,
          });
        }
      }
    },
    [
      email,
      navigate,
      password,
      setCurrentAlert,
      setCurrentUserAtom,
      setIsAlert,
      setIsLoggedIn,
    ]
  );

  useEffect(() => {
    setIsAlert(false);
  }, [setIsAlert]);
  useEffect(() => {
    if (
      isGuest &&
      credentials.email === process.env.REACT_APP_GUEST_EMAIL?.toString() &&
      credentials.password === process.env.REACT_APP_GUEST_PASSWORD?.toString()
    ) {
      submitLoginForm();
      setIsGuest(false);
      setCredentials({
        email: "",
        password: "",
      });
    }
  }, [credentials, isGuest, submitLoginForm]);

  return (
    <div className="relative">
      <div className="alert-div">
        {isAlert && currentAlert.page === "login" ? <ShowAlert /> : ""}
      </div>
      <div className="login-main-div">
        <div className="blur-image-main-div">
          <BlurImage src={galaxy} placeholder={galaxySmall} />
        </div>
        <div className="login-card-main-div">
          <section className="login-intro-card">
            <div className="login-intro-inner-card">
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-bold">
                  Welcome to{" "}
                  <span className="text-orange-600">Knowledge Pro!</span>
                </h2>
                <p>
                  Harness the power of AI with Knowledge Pro. Our platform,
                  powered by the{" "}
                  <span className="text-orange-600 font-semibold">
                    GPT-3.5 Turbo model
                  </span>{" "}
                  provides instant answers to your questions.
                </p>
                <p>
                  Sign in now and unlock a world of knowledge at your
                  fingertips!
                </p>
              </div>
            </div>
          </section>
          <section className="flex items-center h-[100%] text-black md:w-1/2">
            <div className="flex items-center w-full justify-center mx-auto">
              <div className="w-full bg-white rounded-xl sm:max-w-md xl:p-0">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                  <h1 className="text-xl font-bold leading-tight tracking-tight text-black md:text-2xl">
                    Sign in to your account
                  </h1>
                  <form
                    onSubmit={submitLoginForm}
                    className="space-y-4 md:space-y-6"
                    action="#"
                  >
                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Your email
                      </label>
                      <input
                        onChange={(e) => onChange(e)}
                        name="email"
                        id="email"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                        placeholder="abc@mail.com"
                      />
                      {errors[1] ? (
                        <span className="text-red-400">{errors[1].email}</span>
                      ) : (
                        ""
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="password"
                        className="block mb-2 text-sm font-medium text-gray-900 "
                      >
                        Password
                      </label>
                      <input
                        onChange={(e) => onChange(e)}
                        type="password"
                        name="password"
                        id="password"
                        placeholder="••••••••"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      />
                      {errors[2] ? (
                        <span className="text-red-400">
                          {errors[2].password}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                    <button
                      type="submit"
                      className="sign-in"
                    >
                      Sign in
                    </button>
                    <p className="text-center text-gray-600">OR</p>
                    <button
                      onClick={fillGuestCredentials}
                      type="button"
                      className="guest-btn"
                    >
                      Explore as Guest
                    </button>

                    <p className="text-sm font-light text-gray-500">
                      Don’t have an account yet?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/signup")}
                        className="font-medium cursor-pointer text-primary-600 hover:underline"
                      >
                        Sign up
                      </button>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* <div className="absolute bottom-0 w-full">
        <Footer/>
      </div> */}
    </div>
  );
};
