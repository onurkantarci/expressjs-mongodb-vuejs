<template>
  <div class="notes-list">
    <h2>Notes</h2>
    <input
      type="text"
      v-model="searchTerm"
      @input="handleSearch"
      placeholder="Search by title"
    />
    <div v-if="notes.length === 0">No notes found</div>
    <div v-else class="note">
      <ul class="note-between-button" v-for="note in notes" :key="note._id">
        <input type="checkbox" :value="note._id" v-model="selectedNotes" />
        <div class="note-details" @click="editNote(note)">
          <div class="note-title">{{ note.title }}</div>
          <div class="note-description">{{ note.description }}</div>
        </div>
        <button class="delete-button" @click="deleteNote(note._id)">X</button>
      </ul>
    </div>
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="prevPage">Previous</button>
      <span>{{ totalPages > 0 ? currentPage : 0 }} / {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages || totalPages === 0"
        @click="nextPage"
      >
        Next
      </button>
    </div>
    <button @click="deleteSelectedNotes">Delete Selected Notes</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const notes = ref<Note[]>([]);
const searchTerm = ref<string>("");
const router = useRouter();
const selectedNotes = ref<string[]>([]);
const currentPage = ref<number>(1);
const totalPages = ref<number>(1);
const limit = 5;

interface Note {
  _id: string;
  title: string;
  description: string;
}

onMounted(async () => {
  await fetchNotes();
});

watch(searchTerm, () => {
  currentPage.value = 1;
  fetchNotes();
});

async function fetchNotes() {
  try {
    const response = await fetch(
      `http://localhost:3000/notes?page=${
        currentPage.value
      }&limit=${limit}&title=${encodeURIComponent(searchTerm.value)}`
    );
    const data = await response.json();
    notes.value = data.data;
    totalPages.value = data.metadata.totalPages;
  } catch (error) {
    console.error("Error fetching notes:", error);
  }
}

function handleSearch() {
  currentPage.value = 1;
  fetchNotes();
}

async function deleteNote(noteId: string) {
  try {
    const response = await fetch(`http://localhost:3000/notes/${noteId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      notes.value = notes.value.filter((note) => note._id !== noteId);
      console.log("Note deleted successfully");
      fetchNotes();
    } else {
      console.error("Failed to delete note");
    }
  } catch (error) {
    console.error("Error deleting note:", error);
  }
}

function editNote(note: Note) {
  router.push({
    name: "AddNote",
    query: {
      noteId: note._id,
      noteContent: JSON.stringify({
        title: note.title,
        description: note.description,
      }),
    },
  });
}

async function deleteSelectedNotes() {
  try {
    const response = await fetch(`http://localhost:3000/notes/delete-many`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: selectedNotes.value }),
    });
    if (response.ok) {
      const result = await response.json();
      console.log(result.message);
      notes.value = notes.value.filter(
        (note) => !selectedNotes.value.includes(note._id)
      );
      selectedNotes.value = [];
      fetchNotes();
    } else {
      console.error("Failed to delete selected notes");
    }
  } catch (error) {
    console.error("Error deleting selected notes:", error);
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchNotes();
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchNotes();
  }
}
</script>

<style scoped>
.notes-list {
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 0 auto;
  max-width: 300px;
  font-size: 20px;
}
.note {
  display: flex;
  flex-direction: column;
}
.note-between-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  border: 1px solid grey;
  padding: 10px;
}
.note-details {
  width: 100%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: background-color 0.2s;
  margin-right: 10px;
  margin-left: 2px;
}
.note-title {
  font-weight: bold;
}
.note-description {
  font-size: 14px;
  color: grey;
}
.note-details:hover {
  background-color: rgba(0, 255, 187, 0.123);
}
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
