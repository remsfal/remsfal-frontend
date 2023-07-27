<template>
  <div class="root">
    <teleport to="body">
      <div class="modal" v-if="isOpen">
        <div>
          <div class="close">
            <i class="pi pi-fw pi-times" @click="closeModal"></i>
          </div>
          <h2>{{ headingText }}</h2>
          <p>{{  bodyText }}</p>
          <!-- Display the dynamic link text -->
          <button v-if="buttonText" @click="pressedButton" class="button green">{{ buttonText }}</button>
          <div><a v-if="linkText && linkHref" class="link" :href="linkHref">{{ linkText }}</a>
</div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { toRef } from "vue";
// Pass the dynamic link text and href as props
const props = defineProps({
  isOpen: Boolean,
  linkText: String,
  linkHref: String,
  buttonText: String,
  headingText: String,
  bodyText: String
});

const isOpen = toRef(props, 'isOpen');
const linkText = toRef(props, 'linkText');
const linkHref = toRef(props, 'linkHref');
const buttonText = toRef(props, 'buttonText');
const headingText = toRef(props, 'headingText');
const bodyText = toRef(props, 'bodyText');


// Emit closeModal event when clicking on close button
const emit = defineEmits(['closeModal', 'pressedButton']);

const closeModal = () => {
  emit('closeModal');
};

const pressedButton = () => {
  emit('pressedButton');
};
</script>
<style>
.root{
  position: relative;
}
.close{
  display: flex;
  cursor: pointer;
  justify-content: end;
  align-items: end;
  align-self: flex-end;
}
.link{
  cursor: pointer;
  color: #007bff;
  text-decoration: underline;
}
.modal {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.3);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #495057;
}
.modal > div {
    width: 50%;
  height: 50%;
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.modal > div > * {
    margin-bottom: 30px;
    text-align: center;
}

</style>