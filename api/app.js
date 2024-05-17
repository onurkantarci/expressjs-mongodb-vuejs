const express = require("express");
const mongoose = require("mongoose");
const Note = require("./Note");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

mongoose
  .connect("mongodb://localhost/testdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.post("/notes", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    const newNote = new Note({ title, description });

    await newNote.save();

    res.status(201).json(newNote);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/notes", async (req, res) => {
  try {
    const { page = 1, limit = 10, title } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const query = title ? { title: new RegExp(title, "i") } : {};

    const totalNotes = await Note.countDocuments(query);

    const notes = await Note.find(query).skip(skip).limit(limitNumber);

    const totalPages = totalNotes > 0 ? Math.ceil(totalNotes / limitNumber) : 0;

    res.status(200).json({
      data: notes,
      metadata: {
        totalNotes,
        totalPages,
        currentPage: pageNumber > totalPages ? totalPages : pageNumber,
      },
    });
  } catch (error) {
    console.error("Error retrieving notes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNote = await Note.findByIdAndDelete(id);

    if (!deletedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully", deletedNote });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(200).json({ message: "Note updated successfully", updatedNote });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/notes/delete-many", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid or empty array of note IDs" });
    }

    const deletedNotes = await Note.deleteMany({ _id: { $in: ids } });

    if (!deletedNotes || deletedNotes.deletedCount === 0) {
      return res.status(404).json({ error: "No notes found to delete" });
    }

    res.status(200).json({
      message: "Notes deleted successfully",
      deletedCount: deletedNotes.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting notes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
