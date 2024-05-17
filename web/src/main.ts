import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createMemoryHistory, createRouter } from "vue-router";
import NotesList from "./components/NotesList.vue";
import AddNote from "./components/AddNote.vue";

const routes = [
  {
    path: "/",
    name: "NotesList",
    component: NotesList,
  },
  {
    path: "/add-note",
    name: "AddNote",
    component: AddNote,
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");

export default router;
