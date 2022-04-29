import {
  DiscordLogo,
  FacebookLogo,
  GoogleLogo,
  MagicLogo,
  TwitterLogo,
} from './logos';
import { modalStyles } from './styles';

export const createModal = async (props: {
  accentColor?: string;
  customLogo?: string;
  customHeaderText?: string;
}) => {
  // INJECT FORM STYLES
  const style = document.createElement('style');
  style.innerHTML = modalStyles(props.accentColor);
  document.head.appendChild(style);

  // FORM OVERLAY
  const overlay = document.createElement('div');
  overlay.classList.add('MagicLink__formOverlay');

  // FORM CONTAINER
  const formContainer = document.createElement('div');
  formContainer.classList.add('MagicLink__formContainer');
  formContainer.style.transform = 'translate(-50%, -50%) scale(0)';
  formContainer.style.transition = 'all 0.2s ease-in-out';
  setTimeout(() => {
    formContainer.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 100);
  overlay.appendChild(formContainer);

  // FORM CLOSE BUTTON
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.classList.add('MagicLink__closeButton');
  formContainer.appendChild(closeButton);

  // FORM HEADER
  const formHeader = document.createElement('div');
  formHeader.classList.add('MagicLink__formHeader');

  if (!props.customLogo) {
    const logo = document.createElement('div');
    logo.innerHTML = MagicLogo;
    logo.classList.add('MagicLink__logo');
    formHeader.appendChild(logo);
  } else {
    const logo = document.createElement('img');
    logo.src = props.customLogo;
    logo.classList.add('MagicLink__customLogo');
    formHeader.appendChild(logo);
  }
  const logoText = document.createElement('h1');
  logoText.innerHTML = props.customHeaderText || 'Login by Magic Link';
  logoText.classList.add('MagicLink__logoText');
  formHeader.appendChild(logoText);
  formContainer.appendChild(formHeader);

  // FORM BODY
  const formBody = document.createElement('form');
  formBody.classList.add('MagicLink__formBody');
  formBody.onsubmit = async (event) => {
    event.preventDefault();
  };

  // FORM EMAIL LABEL
  const emailLabel = document.createElement('label');
  emailLabel.classList.add('MagicLink__emailLabel');
  emailLabel.innerHTML = 'Sign-in with Email';
  formBody.appendChild(emailLabel);

  // FORM EMAIL INPUT
  const emailInput = document.createElement('input');
  emailInput.classList.add('MagicLink__emailInput');
  emailInput.setAttribute('required', 'true');
  emailInput.setAttribute('type', 'email');
  emailInput.setAttribute('placeholder', 'address@example.com');
  formBody.appendChild(emailInput);

  // FORM SUBMIT BUTTON
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Send login link';
  submitButton.classList.add('MagicLink__submitButton');
  submitButton.type = 'submit';
  formBody.appendChild(submitButton);
  formContainer.appendChild(formBody);

  // FORM OAUTH BUTTONS CONTAINER
  const oauthButtonsContainer = document.createElement('div');
  oauthButtonsContainer.classList.add('MagicLink__oauthButtonsContainer');
  formContainer.appendChild(oauthButtonsContainer);

  // OAUTH BUTTONS
  const providers = [
    { name: 'Google', icon: GoogleLogo },
    { name: 'Discord', icon: DiscordLogo },
    { name: 'Twitter', icon: TwitterLogo },
    { name: 'Facebook', icon: FacebookLogo },
  ];
  providers.forEach((provider) => {
    const oauthButton = document.createElement('button');
    oauthButton.classList.add('MagicLink__oauthButton');
    oauthButton.id = `MagicLinkOauth${provider.name}`;
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
      resolve({ email: '', isGoogle: false, isDiscord: false });
    });

    // for email submit
    submitButton.addEventListener('click', () => {
      const isEmailValid = emailInput.checkValidity();
      if (isEmailValid) {
        const output = {
          email: emailInput.value,
          isGoogle: false,
          isDiscord: false,
        };
        removeForm();
        resolve(output);
      }
    });

    // for oauth buttons
    providers.forEach((provider) => {
      const oauthButton = document.getElementById(
        `MagicLinkOauth${provider.name}`
      );
      oauthButton?.addEventListener('click', () => {
        const output = {
          email: '',
          isGoogle: provider.name === 'Google',
          isDiscord: provider.name === 'Discord',
          isTwitter: provider.name === 'Twitter',
          isFacebook: provider.name === 'Facebook',
        };
        removeForm();
        resolve(output);
      });
    });
  });
};
