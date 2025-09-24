import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Spinner, Alert, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import BASE_API_FRTNEND from "../../config/apiConifg";

export default function TemperatureModal({ show, onClose }) {
  const [mode, setMode] = useState("auto");
  const [temp, setTemp] = useState("");
  const [sensorTemp, setSensorTemp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  // Fetch suhu sensor dari API setiap 5 detik
  useEffect(() => {
    let intervalId;

    const fetchTemperature = async () => {
      try {
        setIsAutoRefreshing(true);
        const res = await axios.get(`${BASE_API_FRTNEND}/api/feature/get-temperature`);

        if (res.data.status === "success") {
          const { active_temperature, sensor_temperature } = res.data.data;

          // Update suhu sensor (selalu untuk monitoring)
          if (sensor_temperature && sensor_temperature.temperature !== undefined) {
            setSensorTemp(parseFloat(sensor_temperature.temperature));
          }

          // Kalau mode = auto, tampilkan sensor langsung
          if (mode === "auto" && sensor_temperature) {
            setTemp(parseFloat(sensor_temperature.temperature).toFixed(1));
          }
        }
      } catch (err) {
        console.error("Failed to fetch temperature:", err);
        toast.error("Gagal memperbarui suhu otomatis");
      } finally {
        setIsAutoRefreshing(false);
      }
    };

    if (show) {
      fetchTemperature();
      intervalId = setInterval(fetchTemperature, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [mode, show]);

  useEffect(() => {
    if (show) {
      setMode("auto");
      setTemp("");
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload =
      mode === "auto"
        ? { mode: "auto" }
        : { temperature: parseFloat(temp), mode: "manual" };

    // Validasi manual
    if (mode === "manual" && isNaN(parseFloat(temp))) {
      toast.error("Harap masukkan angka yang valid");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${BASE_API_FRTNEND}/api/feature/temperature/manual`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success(
          mode === "auto"
            ? "Berhasil mengubah ke mode otomatis"
            : `Suhu ${temp}°C berhasil disimpan`
        );
        onClose();
      }
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Gagal menyimpan suhu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTempChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setTemp(value);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Pengaturan Suhu</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Mode Kontrol</Form.Label>
            <ToggleButtonGroup
              type="radio"
              name="mode"
              value={mode}
              onChange={(val) => {
                setMode(val);
                if (val === "auto" && sensorTemp) {
                  setTemp(sensorTemp.toFixed(1));
                }
              }}
              className="w-100"
            >
              <ToggleButton
                id="auto"
                value="auto"
                variant={mode === "auto" ? "primary" : "outline-primary"}
              >
                Otomatis
              </ToggleButton>
              <ToggleButton
                id="manual"
                value="manual"
                variant={mode === "manual" ? "primary" : "outline-primary"}
              >
                Manual
              </ToggleButton>
            </ToggleButtonGroup>
          </Form.Group>

          {sensorTemp !== null && (
            <Alert variant="info" className="text-center">
              Sensor terkini: <strong>{sensorTemp.toFixed(1)}°C</strong>
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
              Nilai Suhu {mode === "auto" ? "(Otomatis)" : "(Manual)"}
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={
                mode === "auto"
                  ? "Data otomatis dari sensor"
                  : "Masukkan suhu manual"
              }
              value={temp}
              onChange={handleTempChange}
              disabled={mode === "auto"}
              required
              className={mode === "auto" ? "bg-light" : ""}
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" /> Menyimpan...
                </>
              ) : mode === "auto" ? (
                "Aktifkan Mode Otomatis"
              ) : (
                "Simpan Pengaturan"
              )}
            </Button>
            <Button variant="outline-secondary" onClick={onClose}>
              Batal
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
