import { OAuthProvider } from "@magic-ext/oauth";

import {
  appleLogo,
  bitbucketLogo,
  discordLogo,
  facebookLogo,
  githubLogo,
  gitlabLogo,
  googleLogo,
  linkedinLogo,
  MagicLogo,
  microsoftLogo,
  twitchLogo,
  twitterLogo,
} from "./logos";
import { modalStyles } from "./styles";

export const createModal = async (props: {
  accentColor?: string;
  isDarkMode?: boolean;
  customLogo?: string;
  customHeaderText?: string;
  isSMSLoginEnabled?: boolean;
  oauthProviders?: OAuthProvider[];
}) => {
  // INJECT FORM STYLES
  const style = document.createElement("style");
  style.innerHTML = modalStyles(props.accentColor, props.isDarkMode);
  document.head.appendChild(style);

  // PROVIDERS FOR OAUTH BUTTONS
  const providers = [
    { name: "google", icon: googleLogo },
    { name: "facebook", icon: facebookLogo },
    { name: "apple", icon: appleLogo },
    { name: "github", icon: githubLogo },
    { name: "bitbucket", icon: bitbucketLogo },
    { name: "gitlab", icon: gitlabLogo },
    { name: "linkedin", icon: linkedinLogo },
    { name: "twitter", icon: twitterLogo },
    { name: "discord", icon: discordLogo },
    { name: "twitch", icon: twitchLogo },
    { name: "microsoft", icon: microsoftLogo },
  ].filter((provider) => {
    return props.oauthProviders?.includes(provider.name as OAuthProvider);
  });

  // MODAL HTML
  const modal = `
    <div class="Magic__formContainer" id="MagicModalBody">
      <button class="Magic__closeButton" id="MagicCloseBtn">&times;</button>
      <div class="Magic__formHeader">
        ${
          props.customLogo
            ? `<img src="${props.customLogo} class="Magic__customLogo" />`
            : `<div class="Magic__logo">${MagicLogo}</div>`
        }
        <h1 class='Magic__logoText'> ${
          props.customHeaderText || "Login with Magic"
        } </h1>

        <form class="Magic__formBody" id="MagicEmailForm">
          <label class="Magic__emailLabel">
            Sign-in with Email
          </label>
          <input class="Magic__emailInput" id="MagicEmailInput" required type="email" placeholder="address@example.com" />
          <button class="Magic__submitButton" type="submit">
            Send login link
          </button>
        </form>

        ${
          props.isSMSLoginEnabled
            ? `
          <div class="Magic__orLabel">or</div>
          <form class="Magic__formBody" id="MagicPhoneForm">
            <label class="Magic__smsLabel">Sign-in with Phone no.</label>
            <input class="Magic__smsInput" id="MagicSmsInput" required type="tel" placeholder="+1222111234" />
            <button class="Magic__submitButton" type="submit">
              Send login SMS
            </button>
          </form>
        `
            : ``
        }

        <div class="Magic__oauthButtonsContainer">
          ${providers
            .map((provider) => {
              return `
                <button class="Magic__oauthButton" id="MagicOauth${provider.name}" data-provider="${provider.name}" >
                  ${provider.icon}
                </button>
              `;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;

  // ADD FORM TO BODY
  const overlay = document.createElement("div");
  overlay.classList.add("Magic__formOverlay");
  document.body.appendChild(overlay);
  overlay.innerHTML = modal;

  // FORM SUBMIT HANDLER
  const removeForm = () => {
    alert("pressed");
    setTimeout(() => {
      const formBody = document.getElementById("MagicModalBody");
      if (formBody) formBody.style.transform = "translate(-50%, -50%) scale(0)";
    }, 100);
    setTimeout(() => {
      overlay.remove();
    }, 200);
  };

  return new Promise((resolve) => {
    // FORM CLOSE BUTTON
    document.getElementById("MagicCloseBtn")?.addEventListener("click", () => {
      overlay.remove();
      resolve({
        email: "",
        phoneNumber: "",
        isGoogle: false,
        isDiscord: false,
      });
    });

    // EMAIL FORM SUBMIT HANDLER
    document
      .getElementById("MagicEmailForm")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailInputField = document.getElementById(
          "MagicEmailInput"
        ) as HTMLInputElement;
        const isEmailValid = emailInputField?.checkValidity();
        if (isEmailValid) {
          const output = {
            email: emailInputField?.value,
          };
          removeForm();
          resolve(output);
        }
      });

    // SMS FORM SUBMIT HANDLER
    document
      .getElementById("MagicPhoneForm")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        const smsInputField = document.getElementById(
          "MagicSmsInput"
        ) as HTMLInputElement;
        const isPhoneValid = smsInputField?.checkValidity();
        if (isPhoneValid) {
          const output = {
            phoneNumber: smsInputField?.value,
          };
          removeForm();
          resolve(output);
        }
      });

    // OAUTH BUTTONS
    providers.forEach((provider) => {
      const oauthButton = document.getElementById(`MagicOauth${provider.name}`);
      oauthButton?.addEventListener("click", () => {
        const output = {
          oauthProvider: provider.name as OAuthProvider,
        };
        removeForm();
        resolve(output);
      });
    });
  });
};
