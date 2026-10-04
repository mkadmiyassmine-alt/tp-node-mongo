
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Consultation = require("../models/consultation");
const Patient = require("../models/patient");

function handleError(res, err) {
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Données invalides",
      erreurs: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Identifiant invalide"
    });
  }

  console.error(err);
  return res.status(500).json({
    message: "Erreur serveur"
  });
}

// CREATE
router.post("/", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.body.patient)) {
      return res.status(400).json({
        message: "Identifiant du patient invalide"
      });
    }

    const existe = await Patient.exists({
      _id: req.body.patient
    });

    if (!existe) {
      return res.status(404).json({
        message: "Patient introuvable"
      });
    }

    const consultation = new Consultation(req.body);
    await consultation.save();

    res.status(201).json(consultation);
  } catch (err) {
    handleError(res, err);
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const filtre = {};

    if (req.query.patient) {
      filtre.patient = req.query.patient;
    }

    if (req.query.statut) {
      filtre.statut = req.query.statut;
    }

    const consultations = await Consultation
      .find(filtre)
      .populate("patient", "nom prenom")
      .sort({ date: -1 });

    res.json(consultations);
  } catch (err) {
    handleError(res, err);
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const consultation = await Consultation
      .findById(req.params.id)
      .populate("patient", "nom prenom");

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation introuvable"
      });
    }

    res.json(consultation);
  } catch (err) {
    handleError(res, err);
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    if (req.body.patient !== undefined) {
      if (!mongoose.isValidObjectId(req.body.patient)) {
        return res.status(400).json({
          message: "Identifiant du patient invalide"
        });
      }

      const existe = await Patient.exists({
        _id: req.body.patient
      });

      if (!existe) {
        return res.status(404).json({
          message: "Patient introuvable"
        });
      }
    }

    const consultation =
      await Consultation.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          returnDocument: "after",
          runValidators: true
        }
      );

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation introuvable"
      });
    }

    res.json(consultation);
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const consultation =
      await Consultation.findByIdAndDelete(
        req.params.id
      );

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation introuvable"
      });
    }

    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
