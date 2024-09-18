<script setup lang="ts">
import GoogleButton from '@/components/GoogleButton.vue';
</script>

<template>
  <h1 class="header-one">Herzlich Willkommen bei <img src="@/assets/logo.png" alt="logo" /></h1>
  <!-- Generated with https://developers.google.com/identity/branding-guidelines?hl=de -->
  <div class="widgets">
    <div class="info">
      <h2 class="header-two">Alles in einer Anwendung.</h2>
      <p>
        Mit remsfal können Sie Ihre Liegenschaften im Überblick behalten und Anliegen erfassen.
        Remsfal steht für REmote Management Services for connected FAciLities und bietet Ihnen eine
        Anwendung zum Überwachen, Steuern und Verwalten Ihrer Liegenschaften. Es umfasst ein
        effektives Mängelmanagement, die Möglichkeit zur Dokumentationsverwaltung und die
        Überwachung mithilfe einer Fernzugriffstechnologie. <br/>
        Sie können sich über Ihr Google-Mail-Konto anmelden und Ihre Projekte anlegen. Mit der
        Anmeldung stimmen Sie den Nutzungs- und Datenschutzbedingungen zu. <br/>
        Mehr Informationen finden Sie auf der remsfal-Website:
        <a href="https://remsfal.de/">remsfal.de</a>
      </p>
      <GoogleButton />
    </div>
    <div class="widget-column">
      <div class="widget">
        <svg
            fill="#000000"
            width="40px"
            height="40px"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
        >
          <g id="Layer_24" data-name="Layer 24">
            <path
                d="M60,13H53V9a2,2,0,0,0-2-2H48.72A2,2,0,0,0,47,6H41a3,3,0,0,0-3-3H6A3,3,0,0,0,3,6V59a2,2,0,0,0,2,2H33a2,2,0,0,0,2-2V50a3,3,0,0,0-3-3H21V36.9a12.88,12.88,0,0,0,1.5.1A12.51,12.51,0,0,0,35,25h3a3,3,0,0,0,3-3h6a2,2,0,0,0,1.72-1H51a2,2,0,0,0,2-2V15h7a1,1,0,0,0,0-2ZM9,13a1,1,0,0,1-1-1V8A1,1,0,0,1,9,7H25a1,1,0,0,1,1,1v4a1,1,0,0,1-1,1ZM29.91,31.91a10.35,10.35,0,0,1-8.91,3V34.5A9.51,9.51,0,0,1,30.5,25H33A10.41,10.41,0,0,1,29.91,31.91ZM37,12a1,1,0,0,1-1,1H28a1,1,0,0,1-1-1V8a1,1,0,0,1,1-1h8a1,1,0,0,1,1,1Z"
            />
          </g>
        </svg>
        <h2 class="header-widget">Mängelmanagement</h2>
      </div>
      <div class="widget">
        <svg
            fill="#000000"
            width="40px"
            height="40px"
            viewBox="0 0 1920 1920"
            xmlns="http://www.w3.org/2000/svg"
        >
          <g fill-rule="evenodd">
            <path
                d="M1185.471 0v564.706h564.705V1920H169V0h1016.471Zm-225.77 1355.294H507.823v113.054h451.878v-113.054Zm338.711-225.881H507.823v112.94h790.589v-112.94Zm-112.941-225.884H507.823v112.941h677.648V903.529Zm225.882-225.882h-903.53v112.941h903.53V677.647ZM959.701 451.878H507.823v112.941h451.878V451.878Z"
            />
            <path
                d="M1667.673 345.623c30.38 30.268 51.84 66.635 65.619 106.164h-434.937V16.851c39.53 13.779 75.897 35.35 106.278 65.619l263.04 263.153Z"
            />
          </g>
        </svg>
        <h2 class="header-widget">Dokumentation</h2>
      </div>
      <div class="widget">
        <svg
            id="Capa_1"
            fill="#000000"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="40px"
            height="40px"
            viewBox="0 0 482.312 482.312"
            xml:space="preserve"
        >
          <g>
            <g>
              <g>
                <path
                    d="M469.766,329.639c0-5.758-2.297-11.267-6.358-15.344l-4.289-4.272c-5.646,3.641-11.896,6.391-18.777,7.215L295.966,334.1
      				l73.812,73.823c8.465,8.461,22.194,8.461,30.672,0l62.961-62.939C467.469,340.9,469.766,335.396,469.766,329.639z"
                />
                <path
                    d="M446.766,276.865c1.531-4.441,0.41-9.396-2.93-12.715L260.66,80.955c-16.469-16.469-38.804-25.707-62.089-25.707
      				c-23.285,0-45.621,9.238-62.102,25.723c-32.477,32.492-33.805,83.871-4.777,118.387l-35.91,35.906
      				c-5.598,5.602-9.395,12.609-11.371,20.152h-4.637c-6.105-12.844-19.094-21.781-34.262-21.781H9.809
      				c-5.426,0-9.809,4.383-9.809,9.792v56.535c0,5.41,4.383,9.811,9.809,9.811h35.703c15.168,0,28.156-8.957,34.277-21.803h8.637
      				c2.008,3.672,4.352,7.152,7.355,10.156l0.031,0.031c8.336,8.336,19.664,13.035,31.465,13.035
      				c11.801-0.017,23.109-4.699,31.461-13.035l35.34-35.355l29.438,29.441c8.734,8.729,20.52,13.57,32.73,13.57
      				c1.785,0,3.574-0.109,5.379-0.316l174.953-20.438C441.258,284.49,445.215,281.326,446.766,276.865z M141.118,280.506
      				c-7.641,7.625-20.027,7.625-27.648,0c-7.609-7.625-7.609-19.996,0-27.637c7.621-7.625,20.008-7.625,27.648,0
      				C148.727,260.51,148.727,272.881,141.118,280.506z"
                />
                <path
                    d="M475.965,370.83l-6.912-6.914l-49.893,49.875l6.897,6.914c4.078,4.066,9.587,6.359,15.345,6.359
      				s11.276-2.277,15.344-6.345l19.219-19.22C484.428,393.037,484.428,379.307,475.965,370.83z"
                />
              </g>
            </g>
          </g>
        </svg>
        <h2 class="header-widget">Überwachung</h2>
      </div>
    </div>
  </div>
</template>

<style>
.header-one {
  color: #2e6022;
  font-size: 60px;
  font-family: Roboto, arial, sans-serif;
  font-weight: bold;
  height: 100px;
  text-align: center;
}

img {
  max-height: 60%;
}

.info {
  font-family: Roboto, sans-serif;
  font-size: 16px;
}

.header-two {
  font-weight: bold;
  color: #343c3f;
}

.widgets {
  display: flex;
  gap: 1em;
}

.widget {
  background: #eee;
  padding: 1em;
  border-radius: 5px;
  text-align: center;
  width: 300px;
}

.widget-column {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.header-widget {
  font-weight: bold;
  color: #343c3f;
  font-size: 18px;
}
</style>
