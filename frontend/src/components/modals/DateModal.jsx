import { useState, useEffect } from "react";
import { Modal, Button, Form, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import BASE_API_FRTNEND from "../../config/apiConifg";

export default function DateModal({ show, onClose, onSave }) {
  const [mode, setMode] = useState("auto"); 
  const [date, setDate] = useState("");

  useEffect(() => {
    if (mode === "auto") {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      const isoDate = `${year}-${month}-${day}`;
      setDate(isoDate);
    }
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token"); 
      await axios.post(
        `${BASE_API_FRTNEND}/api/feature/edit-date`,
        { date, mode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Tanggal berhasil disimpan");
      if (onSave) {
        onSave({ mode, date });
      }
      onClose();
    } catch (error) {
      console.error("Gagal simpan tanggal:", error);
      toast.error("Gagal menyimpan tanggal");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Atur Tanggal</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Mode Tanggal</Form.Label>
            <ToggleButtonGroup
              type="radio"
              name="mode"
              value={mode}
              onChange={setMode}
              className="w-100"
            >
              <ToggleButton id="auto" value="auto" variant="outline-primary" className="me-2">
                Otomatis
              </ToggleButton>
              <ToggleButton id="manual" value="manual" variant="outline-primary">
                Manual
              </ToggleButton>
            </ToggleButtonGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tanggal</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={mode === "auto"}
              required
              style={{ cursor: mode === "auto" ? "not-allowed" : "pointer" }}
            />
            {mode === "auto" && (
              <Form.Text className="text-muted">
                Tanggal akan mengikuti sistem Anda.
              </Form.Text>
            )}
          </Form.Group>

          <Button type="submit" variant="primary" className="mt-2 w-100">
            Simpan
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}