<script setup lang="ts"></script>

<template>
  <nav>
    <RouterLink to="/">Notes</RouterLink>
    <RouterLink to="/add-note">Add a Note</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
nav {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
