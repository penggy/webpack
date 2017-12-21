<template>
  <div>
    {{ msg }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: "hello"
    };
  },
  mounted() {
    setTimeout(() => {
        this.msg = "world";
    }, 3000);
  }
};
</script>
