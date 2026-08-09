import { useMemo, useState } from "react";
import * as StockCountApi from "../api/StockCountApi.js";

import {
  CalendarDays,
  ChevronDown,
  Clock3,
  FileText,
  Info,
  Loader2,
  Plus,
  X,
} from "lucide-react";


/* =========================================================
   OPTIONS
========================================================= */

const PRIORITIES = [
  {
    value: "low",
    label: "Low",
    dot: "bg-green-400",
  },
  {
    value: "medium",
    label: "Medium",
    dot: "bg-yellow-400",
  },
  {
    value: "high",
    label: "High",
    dot: "bg-red-500",
  },
];


const DEFAULT_COUNT_TYPES = [
  {
    value: "Cycle Count",
    label: "Cycle Count",
  },
  {
    value: "Full Physical",
    label: "Full Physical Count",
  },
  {
    value: "Spot Check",
    label: "Spot Check",
  },
  {
    value: "Recount",
    label: "Recount",
  },
];


const today = () =>
  new Date().toISOString().slice(0, 10);


/* =========================================================
   MODAL WRAPPER
========================================================= */

function Modal({ open, children }) {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/45
        p-4
      "
    >
      <div
        className="
          w-full
          max-w-[880px]
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {children}
      </div>
    </div>
  );
}


/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  children,
  required = false,
}) {
  return (
    <label
      className="
        mb-2 block
        text-[14px]
        font-semibold
        text-slate-700
      "
    >
      {children}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>
  );
}


/* =========================================================
   HELPER TEXT
========================================================= */

function HelperText({ children }) {
  return (
    <p
      className="
        mt-2
        text-[12px]
        leading-5
        text-slate-400
      "
    >
      {children}
    </p>
  );
}


/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  value,
  onChange,
  placeholder,
  options,
  disabled = false,
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        disabled={disabled}
        className="
          h-12
          w-full
          appearance-none
          rounded-xl
          border border-slate-200
          bg-white
          px-4 pr-10
          text-[14px]
          text-slate-800
          outline-none
          transition

          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-100

          disabled:cursor-not-allowed
          disabled:bg-slate-50
          disabled:text-slate-400
        "
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="
          pointer-events-none
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-slate-400
        "
      />
    </div>
  );
}


/* =========================================================
   NEW STOCK COUNT MODAL
========================================================= */

export default function NewStockCountModal({
  open,
  onClose,
  onCreated,

  warehouses = [],
  warehousesLoading = false,
  warehousesError = null,

  locations = [],
  locationsLoading = false,
  locationsError = null,

  users = [],
  usersLoading = false,
  usersError = null,

  countTypes = DEFAULT_COUNT_TYPES,
}) {

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [
    warehouseId,
    setWarehouseId,
  ] = useState("");

  const [
    locationId,
    setLocationId,
  ] = useState("");

  const [
    countType,
    setCountType,
  ] = useState("");

  const [
    priority,
    setPriority,
  ] = useState("medium");

  const [
    scheduledDate,
    setScheduledDate,
  ] = useState(today());

  const [
    startTime,
    setStartTime,
  ] = useState("23:00");

  const [
    assignedCounter,
    setAssignedCounter,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState("");


  /* =======================================================
     WAREHOUSE OPTIONS
  ======================================================= */

  const warehouseOptions = useMemo(() => {
    return warehouses.map((warehouse) => ({
      value: String(warehouse.id),
      label: warehouse.name,
    }));
  }, [warehouses]);


  /* =======================================================
     LOCATION OPTIONS
  ======================================================= */

  const locationOptions = useMemo(() => {
    if (!warehouseId) {
      return [];
    }

    return locations
      .filter((location) => {
        const locationWarehouseId =
          location.warehouse_id ??
          location.warehouseId ??
          location.warehouse?.id;

        return (
          String(locationWarehouseId) ===
          String(warehouseId)
        );
      })
      .map((location) => ({
        value: String(location.id),
        label: location.name,
      }));
  }, [
    locations,
    warehouseId,
  ]);


  /* =======================================================
     USER OPTIONS
  ======================================================= */

  const userOptions = useMemo(() => {
    return users.map((user) => ({
      value: String(user.id),
      label:
        user.name ??
        user.full_name ??
        user.email ??
        `User ${user.id}`,
    }));
  }, [users]);


  /* =======================================================
     PRIORITY META
  ======================================================= */

  const priorityMeta =
    PRIORITIES.find(
      (item) =>
        item.value === priority
    );


  /* =======================================================
     WAREHOUSE CHANGE
  ======================================================= */

  function handleWarehouseChange(value) {
    setWarehouseId(value);

    // A location belongs to a warehouse.
    // Reset the location whenever the warehouse changes.
    setLocationId("");
  }


  /* =======================================================
     RESET FORM
  ======================================================= */

  function resetForm() {
    setWarehouseId("");
    setLocationId("");
    setCountType("");
    setPriority("medium");
    setScheduledDate(today());
    setStartTime("23:00");
    setAssignedCounter("");
    setNotes("");
    setSaveError("");
  }


  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  function closeModal() {
    if (saving) {
      return;
    }

    resetForm();

    onClose?.();
  }


  /* =======================================================
     VALIDATION
  ======================================================= */

  function validate() {
    if (!warehouseId) {
      return "Select a warehouse.";
    }

    if (!countType) {
      return "Select a count type.";
    }

    if (!scheduledDate) {
      return "Select a scheduled date.";
    }

    if (!assignedCounter) {
      return "Select an assigned counter.";
    }

    if (notes.length > 500) {
      return "Notes cannot exceed 500 characters.";
    }

    return null;
  }


  /* =======================================================
     CREATE STOCK COUNT
  ======================================================= */

  async function handleCreate() {
    const validationError =
      validate();

    if (validationError) {
      setSaveError(
        validationError
      );

      return;
    }


    /* -----------------------------------------------------
       Payload must match StockCountApi / backend
    ----------------------------------------------------- */

    const payload = {
      warehouse_id:
        Number(warehouseId),

      warehouse_location_id:
        locationId
          ? Number(locationId)
          : null,

      count_type:
        countType,

      priority,

      count_date:
        scheduledDate,

      start_time:
        startTime || null,

      assigned_to:
        Number(assignedCounter),

      notes:
        notes.trim() || null,
    };


    try {
      setSaving(true);
      setSaveError("");

      const created =
        await StockCountApi.createStockCount(
          payload
        );

      resetForm();

      onCreated?.(created);

    } catch (err) {

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors
          ? Object.values(
              err?.response?.data?.errors ?? {}
            )
              .flat()
              .join(" ")
          : null;

      setSaveError(
        message ||
          err?.message ||
          "Couldn't create the stock count."
      );

    } finally {
      setSaving(false);
    }
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Modal open={open}>

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex
          items-start
          justify-between
          border-b
          border-slate-100
          px-8
          py-7
        "
      >

        <div
          className="
            flex
            items-start
            gap-4
          "
        >

          <div
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-50
              text-blue-600
            "
          >
            <FileText
              size={26}
            />
          </div>


          <div>

            <h2
              className="
                text-[24px]
                font-bold
                leading-8
                text-slate-800
              "
            >
              New Stock Count
            </h2>


            <p
              className="
                mt-1
                text-[15px]
                text-slate-500
              "
            >
              Create a new stock count to record physical inventory.
            </p>

          </div>

        </div>


        <button
          type="button"
          onClick={closeModal}
          disabled={saving}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-slate-50
            text-slate-500
            transition-colors
            hover:bg-slate-100
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <X size={20} />
        </button>

      </div>


      {/* =================================================
          BODY
      ================================================= */}

      <div
        className="
          max-h-[72vh]
          overflow-y-auto
          px-8
          py-7
        "
      >

        {/* ===============================================
            ERROR
        =============================================== */}

        {(
          saveError ||
          warehousesError ||
          locationsError ||
          usersError
        ) && (
          <div
            className="
              mb-5
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-[13px]
              text-red-700
            "
          >
            {saveError ||
              warehousesError ||
              locationsError ||
              usersError}
          </div>
        )}


        {/* ===============================================
            COUNT INFORMATION
        =============================================== */}

        <h3
          className="
            mb-5
            text-[16px]
            font-bold
            text-slate-800
          "
        >
          Count Information
        </h3>


        <div
          className="
            grid
            grid-cols-1
            gap-x-6
            gap-y-6
            md:grid-cols-2
          "
        >

          {/* =============================================
              WAREHOUSE
          ============================================= */}

          <div>

            <FieldLabel required>
              Warehouse
            </FieldLabel>

            <SelectField
              value={warehouseId}
              onChange={
                handleWarehouseChange
              }
              placeholder={
                warehousesLoading
                  ? "Loading warehouses..."
                  : "Select warehouse"
              }
              options={
                warehouseOptions
              }
              disabled={
                warehousesLoading
              }
            />

          </div>


          {/* =============================================
              LOCATION
          ============================================= */}

          <div>

            <FieldLabel>
              Location
            </FieldLabel>

            <SelectField
              value={locationId}
              onChange={
                setLocationId
              }
              placeholder={
                !warehouseId
                  ? "Select warehouse first"
                  : locationsLoading
                  ? "Loading locations..."
                  : "Select location"
              }
              options={
                locationOptions
              }
              disabled={
                !warehouseId ||
                locationsLoading
              }
            />

            <HelperText>
              Specific area or zone for this count (optional).
            </HelperText>

          </div>


          {/* =============================================
              COUNT TYPE
          ============================================= */}

          <div>

            <FieldLabel required>
              Count Type
            </FieldLabel>

            <SelectField
              value={countType}
              onChange={
                setCountType
              }
              placeholder="Select count type"
              options={countTypes}
            />

            <HelperText>
              Choose the type of stock count you want to perform.
            </HelperText>

          </div>


          {/* =============================================
              PRIORITY
          ============================================= */}

          <div>

            <FieldLabel>
              Priority
            </FieldLabel>


            <div className="relative">

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(
                    e.target.value
                  )
                }
                className="
                  h-12
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-10
                  pr-10
                  text-[14px]
                  text-slate-800
                  outline-none

                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              >

                {PRIORITIES.map(
                  (item) => (
                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                    >
                      {
                        item.label
                      }
                    </option>
                  )
                )}

              </select>


              <span
                className={`
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  rounded-full
                  border
                  border-black/10
                  ${priorityMeta?.dot ?? ""}
                `}
              />


              <ChevronDown
                size={16}
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

            </div>


            <HelperText>
              Set the priority level for this count.
            </HelperText>

          </div>


          {/* =============================================
              SCHEDULED DATE
          ============================================= */}

          <div>

            <FieldLabel required>
              Scheduled Date
            </FieldLabel>


            <div className="relative">

              <input
                type="date"
                value={
                  scheduledDate
                }
                onChange={(e) =>
                  setScheduledDate(
                    e.target.value
                  )
                }
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  pr-11
                  text-[14px]
                  text-slate-800
                  outline-none

                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />


              <CalendarDays
                size={18}
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

            </div>

          </div>


          {/* =============================================
              START TIME
          ============================================= */}

          <div>

            <FieldLabel>
              Start Time
            </FieldLabel>


            <div className="relative">

              <input
                type="time"
                value={
                  startTime
                }
                onChange={(e) =>
                  setStartTime(
                    e.target.value
                  )
                }
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  pr-11
                  text-[14px]
                  text-slate-800
                  outline-none

                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />


              <Clock3
                size={18}
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

            </div>

          </div>


          {/* =============================================
              ASSIGNED COUNTER
          ============================================= */}

          <div className="md:col-span-2">

            <FieldLabel required>
              Assigned Counter
            </FieldLabel>


            <SelectField
              value={
                assignedCounter
              }
              onChange={
                setAssignedCounter
              }
              placeholder={
                usersLoading
                  ? "Loading users..."
                  : "Select user"
              }
              options={
                userOptions
              }
              disabled={
                usersLoading
              }
            />


            <HelperText>
              Person responsible for conducting this count.
            </HelperText>

          </div>

        </div>


        {/* ===============================================
            NOTES
        =============================================== */}

        <div
          className="
            mt-7
            border-t
            border-slate-100
            pt-7
          "
        >

          <h3
            className="
              mb-5
              text-[16px]
              font-bold
              text-slate-800
            "
          >
            Notes
          </h3>


          <FieldLabel>
            Notes (Optional)
          </FieldLabel>


          <div className="relative">

            <textarea
              value={notes}
              maxLength={500}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Add any additional notes or instructions for this stock count..."
              className="
                min-h-[118px]
                w-full
                resize-none
                rounded-xl
                border
                border-slate-200
                px-4
                py-3
                pb-9
                text-[14px]
                leading-6
                text-slate-800
                outline-none
                placeholder:text-slate-400

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            />


            <span
              className="
                absolute
                bottom-3
                right-4
                text-[12px]
                text-slate-400
              "
            >
              {notes.length} / 500
            </span>

          </div>


          {/* =============================================
              INFORMATION PANEL
          ============================================= */}

          <div
            className="
              mt-7
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-blue-200
              bg-blue-50
              px-5
              py-4
            "
          >

            <Info
              size={21}
              className="
                mt-0.5
                shrink-0
                text-blue-600
              "
            />


            <div>

              <p
                className="
                  text-[14px]
                  font-bold
                  text-blue-800
                "
              >
                What happens next?
              </p>


              <p
                className="
                  mt-0.5
                  text-[13px]
                  text-blue-600
                "
              >
                After creating the stock count, you can add items and begin the counting process.
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div
        className="
          flex
          items-center
          justify-between
          border-t
          border-slate-100
          px-8
          py-5
        "
      >

        {/* CANCEL */}

        <button
          type="button"
          onClick={
            closeModal
          }
          disabled={
            saving
          }
          className="
            h-11
            rounded-xl
            border
            border-slate-200
            bg-white
            px-6
            text-[14px]
            font-semibold
            text-slate-700
            transition-colors

            hover:bg-slate-50

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          Cancel
        </button>


        {/* CREATE */}

        <button
          type="button"
          onClick={
            handleCreate
          }
          disabled={
            saving
          }
          className="
            flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-blue-600
            px-7
            text-[14px]
            font-semibold
            text-white
            transition-colors

            hover:bg-blue-700

            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >

          {saving ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Plus
              size={18}
            />
          )}


          {saving
            ? "Creating..."
            : "Create Stock Count"}

        </button>

      </div>

    </Modal>
  );
}