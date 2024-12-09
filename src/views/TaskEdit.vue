<template>
    <div>
      <h1>Edit Task</h1>
      <p>Task ID: {{ taskId }}</p>
    </div>
  </template>
  
  <script>
  export default {
    computed: {
      taskId() {
        return this.$route.params.taskid;
      },
    },
  };
  </script>
  