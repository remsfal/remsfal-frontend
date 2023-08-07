<template>
  <div class="root">
    <teleport to="body">
      <div class="modal" v-if="isOpen">
        <div>
          <div class="close">
            <i class="pi pi-fw pi-times" @click="closeModal"></i>
          </div>
          <h2>{{ headingText }}</h2>
          <p>{{ bodyText }}</p>
          <input v-if="hasInput" v-model="inputValue" />
          <select v-if="hasSelect" v-model="selectValue" name="options" id="options">
            <option value="" selected disabled>Select an option</option>
            <option
              v-for="(option, index) in options"
              :key="index"
              :value="option"
            >
              {{ option }}
            </option>
          </select>

          <button v-if="showButton" class="button green"
            @click="pressedButton"
            :class="`button ${buttonColor}`"
          >
            {{ buttonText }}
          </button>

          <div>
            <a v-if="linkText && linkHref" class="link" :href="linkHref">{{
              linkText
            }}</a>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, watchEffect, toRef, onMounted } from "vue";

const props = defineProps({
  isOpen: Boolean,
  linkText: String,
  linkHref: String,
  buttonText: String,
  headingText: String,
  bodyText: String,
  buttonColor: String,
  hasInput: Boolean,
  hasSelect: Boolean,
  options: Array,
});

const isOpen = toRef(props, "isOpen");
const linkText = toRef(props, "linkText");
const linkHref = toRef(props, "linkHref");
const buttonText = toRef(props, "buttonText");
const headingText = toRef(props, "headingText");
const bodyText = toRef(props, "bodyText");
const buttonColor = toRef(props, "buttonColor");
const hasInput = toRef(props, "hasInput");
const hasSelect = toRef(props, "hasSelect");
const inputValue = ref("");
const selectValue = ref("");
const showButton = ref(true);
const options = toRef(props, "options");

const emit = defineEmits(["closeModal", "pressedButton"]);

const closeModal = () => {
  emit("closeModal");
};

const pressedButton = () => {
  console.log("presedButton", hasInput.value, hasSelect.value);
  if(!hasInput.value && !hasSelect.value){
    emit("pressedButton");
  }

  if(hasInput.value && !hasSelect.value){
    emit("pressedButton", inputValue.value);
  }
    if(!hasInput.value && hasSelect.value){
    emit("pressedButton", selectValue.value);
  }
  if(hasInput.value && hasSelect.value){
    emit("pressedButton", {text: inputValue.value, select: selectValue.value});
  }
};
watchEffect(() => {

if(hasSelect.value && !hasInput.value){
  if (selectValue.value.trim().length > 0) {
    showButton.value = true;
  } else {
    showButton.value = false;
  }
  
}

if(hasInput.value && !hasSelect.value){
  if (inputValue.value.trim().length > 0) {
    showButton.value = true;
  } else {
    showButton.value = false;
  }
  
}

if(hasInput.value && hasSelect.value){

  if (inputValue.value.trim().length > 0 && selectValue.value.trim().length > 0 ) {
    showButton.value = true;
  } else {
    showButton.value = false;
  }
}
});
</script>

<style>
.root {
  position: relative;
}
.close {
  display: flex;
  cursor: pointer;
  justify-content: end;
  align-items: end;
  align-self: flex-end;
}
.link {
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
