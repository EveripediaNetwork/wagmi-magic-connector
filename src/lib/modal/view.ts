import { OAuthProvider } from '@magic-ext/oauth';

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
} from './logos';
import { modalStyles } from './styles';

export const createModal = async (props: {
  accentColor?: string;
  isDarkMode?: boolean;
  customLogo?: string;
  customHeaderText?: string;
  isSMSLoginEnabled?: boolean;
  oauthProviders?: OAuthProvider[];
}) => {
  // INJECT FORM STYLES
  const style = document.createElement('style');
  style.innerHTML = modalStyles(props.accentColor, props.isDarkMode);
  document.head.appendChild(style);

  // PROVIDERS FOR OAUTH BUTTONS
  const providers = [
    { name: 'google', icon: googleLogo },
    { name: 'facebook', icon: facebookLogo },
    { name: 'apple', icon: appleLogo },
    { name: 'github', icon: githubLogo },
    { name: 'bitbucket', icon: bitbucketLogo },
    { name: 'gitlab', icon: gitlabLogo },
    { name: 'linkedin', icon: linkedinLogo },
    { name: 'twitter', icon: twitterLogo },
    { name: 'discord', icon: discordLogo },
    { name: 'twitch', icon: twitchLogo },
    { name: 'microsoft', icon: microsoftLogo },
  ].filter((provider) => {
    return props.oauthProviders?.includes(provider.name as OAuthProvider);
  });

  const phoneNumberRegex = `(\\+|00)[0-9]{1,3}[0-9]{4,14}(?:x.+)?$`;
  const emailRegex = `^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})`;

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
        <h1 class='Magic__logoText'> ${props.customHeaderText || 'Magic'} </h1>

        <form class="Magic__formBody" id="MagicForm">
          ${
            props.isSMSLoginEnabled
              ? `
               <label class="Magic__FormLabel">Sign-in with Phone or Email</label>
               <input class="Magic__formInput" id="MagicFormInput" required pattern = "${emailRegex}|${phoneNumberRegex}" placeholder="Phone or Email" />
               `
              : `
               <label class="Magic__FormLabel">Sign-in with Email</label>
               <input class="Magic__formInput" id="MagicFormInput" required type="email" placeholder="address@example.com" />
               `
          }
          <button class="Magic__submitButton" type="submit">
            Send login link
          </button>
        </form>
        ${
          providers.length > 0
            ? `<div class="Magic__divider">
        &#9135;&#9135;&#9135; OR &#9135;&#9135;&#9135;
        </div>`
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
            .join('')}
        </div>
      </div>
    </div>
  `;

  // ADD FORM TO BODY
  const overlay = document.createElement('div');
  overlay.classList.add('Magic__formOverlay');
  document.body.appendChild(overlay);
  overlay.innerHTML = modal;
  const formBody = document.getElementById('MagicModalBody');
  setTimeout(() => {
    if (formBody) formBody.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 100);

  // FORM SUBMIT HANDLER
  const removeForm = () => {
    if (formBody) formBody.style.transform = 'translate(-50%, -50%) scale(0)';
    setTimeout(() => {
      overlay.remove();
    }, 200);
  };

  return new Promise((resolve) => {
    // FORM CLOSE BUTTON
    document.getElementById('MagicCloseBtn')?.addEventListener('click', () => {
      removeForm();
      resolve({
        email: '',
        phoneNumber: '',
        isGoogle: false,
        isDiscord: false,
      });
    });

    // EMAIL FORM SUBMIT HANDLER
    document.getElementById('MagicForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formInputField = document.getElementById(
        'MagicFormInput'
      ) as HTMLInputElement;
      const isFormValid = formInputField?.checkValidity();
      if (isFormValid) {
        let output;
        if (RegExp(phoneNumberRegex).test(formInputField.value)) {
          output = {
            phoneNumber: formInputField?.value,
          };
        } else {
          output = {
            email: formInputField?.value,
          };
        }
        removeForm();
        resolve(output);
      }
    });

    // OAUTH BUTTONS
    providers.forEach((provider) => {
      const oauthButton = document.getElementById(`MagicOauth${provider.name}`);
      oauthButton?.addEventListener('click', () => {
        const output = {
          oauthProvider: provider.name as OAuthProvider,
        };
        removeForm();
        resolve(output);
      });
    });
  });
};
