<template>
  <form @submit.prevent="submitNote">
    <div class="note-form">
      <label for="title">Title</label>
      <input type="text" id="title" name="title" v-model="title" />

      <label for="description">Description</label>
      <textarea
        id="description"
        name="description"
        v-model="description"
      ></textarea>

      <button type="submit">Submit</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import router from "../main";

const title = ref("");
const description = ref("");
const route = useRoute();

onMounted(() => {
  if (route.query.noteContent) {
    const noteContent = JSON.parse(route.query.noteContent as string);
    title.value = noteContent.title;
    description.value = noteContent.description;
  }
});

async function submitNote() {
  try {
    const method = route.query.noteId ? "PUT" : "POST";
    const url = route.query.noteId
      ? `http://localhost:3000/notes/${route.query.noteId}`
      : `http://localhost:3000/notes`;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.value,
        description: description.value,
      }),
    });

    if (response.ok) {
      console.log(
        method === "POST"
          ? "Note created successfully"
          : "Note updated successfully"
      );
      title.value = "";
      description.value = "";
      router.push({ name: "NotesList" });
    } else {
      console.error(
        method === "POST" ? "Failed to create note" : "Failed to update note"
      );
    }
  } catch (error) {
    console.error("Error creating/updating note:", error);
  }
}
</script>

<style scoped>
.note-form {
  display: flex;
  justify-content: center;
  flex-direction: column;
  max-width: 200px;
  margin: 0 auto;
  gap: 5px;
  margin-top: 100px;
}
</style>
