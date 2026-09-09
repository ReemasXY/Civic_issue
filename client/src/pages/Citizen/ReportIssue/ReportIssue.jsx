import React, { useState, useRef } from "react";
import { FiChevronDown, FiImage, FiMapPin } from "react-icons/fi";
import LocationSearchInput from "../../../components/map/LocationSearchInput";
import LocationPickerMap from "../../../components/map/LocationPickerMap";
import axios from "axios";

import Loading from "./Loading";
import VerificationModal from "./VerificationModal";

const CATEGORY_OPTIONS = [
  "Pothole",
  "Garbage / Waste",
  "Water Supply",
  "Drainage",
  "Road Damage",
];

export default function ReportIssue({ onSubmit, nearbyIssues = [] }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Pothole");
  const [description, setDescription] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // =========================
  // VERIFICATION STATES
  // =========================

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showVerificationModal, setShowVerificationModal] =
    useState(false);

  const fileInputRef = useRef(null);

  // =========================
  // NEARBY MARKERS
  // =========================

  const nearbyMarkers = nearbyIssues.map((issue) => ({
    id: issue.id,
    lat: issue.latitude,
    lon: issue.longitude,
    label: issue.title,
  }));

  // =========================
  // IMAGE PICK
  // =========================

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // If a previous verification result exists,
    // remove it when a new image is selected.
    setVerificationResult(null);
    setShowVerificationModal(false);
  };

  // =========================
  // FORM VALIDATION
  // =========================

  const isFormValid =
    title.trim() !== "" &&
    category !== "" &&
    description.trim() !== "" &&
    selectedLocation?.lat != null &&
    selectedLocation?.lon != null &&
    imageFile !== null;

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    try {
      // ========================================
      // SHOW LOADING MODAL
      // ========================================

      setIsVerifying(true);

      // Close any previous result modal
      setShowVerificationModal(false);
      setVerificationResult(null);

      console.log("========================================");
      console.log("SUBMITTING ISSUE FOR IMAGE VERIFICATION");
      console.log("========================================");

      console.log("Selected category:", category);
      console.log("Image:", imageFile);

      // ========================================
      // CREATE FORMDATA
      // ========================================

      const formData = new FormData();

      formData.append("category", category);
      formData.append("image", imageFile);

      // ========================================
      // SEND TO BACKEND
      // ========================================

      const response = await axios.post(
        "http://localhost:5000/api/reports/verify-image",
        formData
      );

      console.log("========================================");
      console.log("AI VERIFICATION RESPONSE");
      console.log("========================================");

      console.log("Full backend response:");
      console.log(response.data);

      // ========================================
      // GET VERIFICATION RESULT
      // ========================================

      const verification = response.data.verification;

      console.log("----------------------------------------");
      console.log("STATUS:", verification.status);
      console.log(
        "IS CIVIC ISSUE:",
        verification.isCivicIssue
      );
      console.log(
        "SELECTED CATEGORY:",
        verification.selectedCategory
      );
      console.log(
        "PREDICTED CATEGORY:",
        verification.predictedCategory
      );
      console.log(
        "CONFIDENCE:",
        `${verification.confidence}%`
      );
      console.log(
        "CIVIC SCORE:",
        `${verification.civicScore}%`
      );
      console.log(
        "NON-CIVIC SCORE:",
        `${verification.nonCivicScore}%`
      );
      console.log(
        "MESSAGE:",
        verification.message
      );

      console.log("========================================");

      // ========================================
      // SAVE RESULT
      // ========================================

      setVerificationResult(verification);

      // ========================================
      // HIDE LOADING MODAL
      // ========================================

      setIsVerifying(false);

      // ========================================
      // SHOW RESULT MODAL
      // ========================================

      setShowVerificationModal(true);

      // ========================================
      // HANDLE SUCCESS
      // ========================================

      if (verification.status === "VALID") {
        console.log(
          "✅ Image verified successfully."
        );

        /*
         * IMPORTANT:
         *
         * Do NOT submit the complete report here yet
         * unless you want the report to be saved
         * immediately after image verification.
         *
         * The VerificationModal will show first.
         */
      }

      // ========================================
      // HANDLE NOT CIVIC ISSUE
      // ========================================

      if (
        verification.status === "NOT_CIVIC_ISSUE"
      ) {
        console.log(
          "❌ Image rejected: Not a civic issue."
        );
      }

      // ========================================
      // HANDLE INVALID CATEGORY
      // ========================================

      if (
        verification.status === "INVALID_CATEGORY"
      ) {
        console.log(
          "❌ Image rejected: Wrong category."
        );
      }

    } catch (error) {
      console.error(
        "========================================"
      );

      console.error(
        "IMAGE VERIFICATION FAILED"
      );

      console.error(
        "========================================"
      );

      console.error("Error:", error);

      // ========================================
      // HIDE LOADING
      // ========================================

      setIsVerifying(false);

      // ========================================
      // CREATE ERROR RESULT
      // ========================================

      const errorResult = {
        status: "error",
        message:
          error.response?.data?.message ||
          "Unable to verify the image. Please try again.",
      };

      setVerificationResult(errorResult);

      // ========================================
      // SHOW ERROR MODAL
      // ========================================

      setShowVerificationModal(true);

      if (error.response) {
        console.error(
          "Backend status:",
          error.response.status
        );

        console.error(
          "Backend response:",
          error.response.data
        );
      } else if (error.request) {
        console.error(
          "No response received from backend."
        );
      } else {
        console.error(
          "Request error:",
          error.message
        );
      }
    }
  };

  // =========================
  // CLOSE VERIFICATION MODAL
  // =========================

  const handleVerificationClose = () => {
    setShowVerificationModal(false);
  };

  // =========================
  // TRY AGAIN
  // =========================

  const handleTryAgain = () => {
    setShowVerificationModal(false);

    // Open image picker again
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  return (
    <>
      {/* =========================================
          REPORT ISSUE FORM
      ========================================== */}

      <div className="w-full px-6 md:px-5 pb-10 bg-white">

        <div className="w-full p-6 md:p-8">

          {/* Header */}

          <div className="mb-7">

            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              Report a New Issue
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Provide the details below to submit a civic issue report.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

              {/* =========================
                  LEFT COLUMN
              ========================== */}

              <div className="flex flex-col gap-5">

                {/* Category */}

                <Field label="Category" required>

                  <div className="relative">

                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value)
                      }
                      required
                      className="w-full appearance-none border border-slate-300 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors cursor-pointer"
                    >

                      {CATEGORY_OPTIONS.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        )
                      )}

                    </select>

                    <FiChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                  </div>

                </Field>

                {/* Issue Title */}

                <Field label="Issue Title" required>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="e.g. Large pothole near the main road"
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                  />

                </Field>

                {/* Description */}

                <Field label="Description" required>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    placeholder="Describe the issue in detail..."
                    rows={6}
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                  />

                </Field>

                {/* Location */}

                <Field label="Location" required>

                  <LocationSearchInput
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                    variant="inline"
                  />

                </Field>

              </div>

              {/* =========================
                  RIGHT COLUMN
              ========================== */}

              <div className="flex flex-col gap-6">

                {/* IMAGE */}

                <Field label="Issue Image" required>

                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-64 flex items-center justify-center">

                    {imagePreview ? (

                      <img
                        src={imagePreview}
                        alt="Issue preview"
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <div className="flex flex-col items-center justify-center gap-3 text-slate-400">

                        <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center">

                          <FiImage size={28} />

                        </div>

                        <div className="text-center">

                          <p className="text-sm font-medium text-slate-500">
                            No image selected
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            Upload a clear image of the issue
                          </p>

                        </div>

                      </div>

                    )}

                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImagePick}
                    required
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="mt-3 border border-slate-300 text-slate-700 bg-white text-sm font-medium rounded-xl px-5 py-2.5 hover:bg-slate-50 hover:border-teal-500 hover:text-teal-600 transition-all cursor-pointer"
                  >
                    {imagePreview
                      ? "Change Image"
                      : "Choose Image"}
                  </button>

                </Field>

                {/* MAP */}

                <div>

                  <div className="flex items-center gap-2 mb-2">

                    <FiMapPin
                      className="text-teal-600"
                      size={17}
                    />

                    <label className="text-sm font-semibold text-slate-700">

                      Select Location on Map

                      <span className="text-red-500 ml-1">
                        *
                      </span>

                    </label>

                  </div>

                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">

                    <LocationPickerMap
                      value={selectedLocation}
                      onChange={setSelectedLocation}
                      height="h-80"
                      nearbyMarkers={nearbyMarkers}
                    />

                  </div>

                  {selectedLocation && (

                    <div className="mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">

                      <p className="text-xs text-slate-500">
                        Selected location
                      </p>

                      <p className="text-sm text-slate-700 font-medium truncate">
                        {selectedLocation.label}
                      </p>

                    </div>

                  )}

                </div>

              </div>

            </div>

            {/* SUBMIT */}

            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">

              <button
                type="submit"
                disabled={!isFormValid || isVerifying}
                className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                  isFormValid && !isVerifying
                    ? "text-white bg-slate-800 hover:bg-slate-900 cursor-pointer"
                    : "text-slate-400 bg-slate-200 cursor-not-allowed"
                }`}
              >
                {isVerifying
                  ? "Verifying Image..."
                  : isFormValid
                  ? "Submit Issue Report"
                  : "Complete All Fields"}
              </button>

            </div>

          </form>

        </div>

      </div>

      {/* =========================================
          LOADING MODAL
      ========================================== */}

      {isVerifying && (
        <Loading category={category} />
      )}

      {/* =========================================
          VERIFICATION RESULT MODAL
      ========================================== */}

      {showVerificationModal && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={handleVerificationClose}
          onTryAgain={handleTryAgain}
          verificationResult={verificationResult}
          category={category}
        />
      )}

    </>
  );
}


/* =========================
   FIELD COMPONENT
========================= */

function Field({
  label,
  required = false,
  children,
}) {
  return (
    <div>

      <label className="block text-sm font-semibold text-slate-700 mb-2">

        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}