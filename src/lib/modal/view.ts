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
  oauthProviders?: OAuthProvider[];
}) => {
  // INJECT FORM STYLES
  const style = document.createElement('style');
  style.innerHTML = modalStyles(props.accentColor, props.isDarkMode);
  document.head.appendChild(style);

  // FORM OVERLAY
  const overlay = document.createElement('div');
  overlay.classList.add('Magic__formOverlay');

  // FORM CONTAINER
  const formContainer = document.createElement('div');
  formContainer.classList.add('Magic__formContainer');
  formContainer.style.transform = 'translate(-50%, -50%) scale(0)';
  formContainer.style.transition = 'all 0.2s ease-in-out';
  setTimeout(() => {
    formContainer.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 100);
  overlay.appendChild(formContainer);

  // FORM CLOSE BUTTON
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.classList.add('Magic__closeButton');
  formContainer.appendChild(closeButton);

  // FORM HEADER
  const formHeader = document.createElement('div');
  formHeader.classList.add('Magic__formHeader');

  if (!props.customLogo) {
    const logo = document.createElement('div');
    logo.innerHTML = MagicLogo;
    logo.classList.add('Magic__logo');
    formHeader.appendChild(logo);
  } else {
    const logo = document.createElement('img');
    logo.src = props.customLogo;
    logo.classList.add('Magic__customLogo');
    formHeader.appendChild(logo);
  }
  const logoText = document.createElement('h1');
  logoText.innerHTML = props.customHeaderText || 'Login with Magic';
  logoText.classList.add('Magic__logoText');
  formHeader.appendChild(logoText);
  formContainer.appendChild(formHeader);

  // FORM BODY
  const formBody = document.createElement('form');
  formBody.classList.add('Magic__formBody');
  formBody.onsubmit = async (event) => {
    event.preventDefault();
  };

  // FORM EMAIL LABEL
  const emailLabel = document.createElement('label');
  emailLabel.classList.add('Magic__emailLabel');
  emailLabel.innerHTML = 'Sign-in with Email';
  formBody.appendChild(emailLabel);

  // FORM EMAIL INPUT
  const emailInput = document.createElement('input');
  emailInput.classList.add('Magic__emailInput');
  emailInput.setAttribute('required', 'true');
  emailInput.setAttribute('type', 'email');
  emailInput.setAttribute('placeholder', 'address@example.com');
  formBody.appendChild(emailInput);

  // FORM OR LABEL
  const orLabel = document.createElement('label');
  orLabel.classList.add('Magic__orLabel');
  orLabel.innerHTML = 'or';
  formBody.appendChild(orLabel);

  // FORM SMS LABEL
  const smsLabel = document.createElement('label');
  smsLabel.classList.add('Magic__smsLabel');
  smsLabel.innerHTML = 'Sign-in with Phone no.';
  formBody.appendChild(smsLabel);

  // FORM SMS INPUT
  const smsInput = document.createElement('input');
  smsInput.classList.add('Magic__smsInput');
  // smsInput.setAttribute('required', 'false');
  smsInput.setAttribute('type', 'phoneNumber');
  smsInput.setAttribute('placeholder', '+1222111234');
  formBody.appendChild(smsInput);

  // FORM SUBMIT BUTTON
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Send login link';
  submitButton.classList.add('Magic__submitButton');
  submitButton.type = 'submit';
  formBody.appendChild(submitButton);
  formContainer.appendChild(formBody);

  // FORM OAUTH BUTTONS CONTAINER
  const oauthButtonsContainer = document.createElement('div');
  oauthButtonsContainer.classList.add('Magic__oauthButtonsContainer');
  formContainer.appendChild(oauthButtonsContainer);

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

  // OAUTH BUTTONS
  providers.forEach((provider) => {
    const oauthButton = document.createElement('button');
    oauthButton.classList.add('Magic__oauthButton');
    oauthButton.id = `MagicOauth${provider.name}`;
    oauthButton.innerHTML = provider.icon;
    oauthButton.setAttribute('data-provider', provider.name);
    oauthButtonsContainer.appendChild(oauthButton);
  });

  // APPEND FORM TO BODY
  document.body.appendChild(overlay);

  // FORM SUBMIT HANDLER
  const removeForm = () => {
    setTimeout(() => {
      formContainer.style.transform = 'translate(-50%, -50%) scale(0)';
    }, 100);
    setTimeout(() => {
      overlay.remove();
    }, 200);
  };
  return new Promise((resolve) => {
    // for close button
    closeButton.addEventListener('click', () => {
      removeForm();
      resolve({ email: '', phoneNumber: '', isGoogle: false, isDiscord: false });
    });

    // for email submit
    submitButton.addEventListener('click', () => {
      const isEmailValid = emailInput.checkValidity();
      if (isEmailValid) {
        const output = {
          email: emailInput.value,
          phoneNumber: smsInput.value,
        };
        removeForm();
        resolve(output);
      }
    });

    // for oauth buttons
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
