import {
  useEffect,
  useMemo,
  useState,
} from "react";

import * as StockCountApi from "../api/StockCountApi.js";

import {
  ChevronDown,
  FileText,
  Info,
  Loader2,
  Plus,
  Save,
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

/* =========================================================
   DATE HELPER
========================================================= */

/*
 * count_date is a local/business calendar date.
 * Do not use toISOString() here because that converts
 * the current time to UTC first and can produce the
 * wrong date for the user's timezone.
 */
function getLocalDate() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    now.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================================================
   MODAL WRAPPER
========================================================= */

function Modal({
  open,
  children,
}) {
  if (!open) {
    return null;
  }

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

function HelperText({
  children,
}) {
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
        onChange={(event) =>
          onChange(
            event.target.value,
          )
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

        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          ),
        )}
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
   STOCK COUNT MODAL
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

  /*
   * Details page passes mapped lookup data
   * through this prop.
   */
  lookups = null,

  /*
   * EDIT MODE
   */
  isEditing = false,
  initialForm = null,
  onSave,
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
  ] = useState(
    getLocalDate(),
  );

  const [
    startTime,
    setStartTime,
  ] = useState("");

  const [
    assignedCounter,
    setAssignedCounter,
  ] = useState("");

  const [
    assignedCounterName,
    setAssignedCounterName,
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
     LOOKUP SOURCES

     Supports both:
     - raw API arrays from StockCountsPage
     - mapped lookups from dataLayer / Details
  ======================================================= */

  const sourceWarehouses =
    lookups?.warehouses ??
    warehouses ??
    [];

  const sourceLocations =
    lookups?.locations ??
    lookups?.warehouse_locations ??
    locations ??
    [];

  const sourceUsers =
    lookups?.users ??
    lookups?.counters ??
    users ??
    [];

  /* =======================================================
     WAREHOUSE OPTIONS
  ======================================================= */

  const warehouseOptions =
    useMemo(() => {
      return sourceWarehouses.map(
        (warehouse) => ({
          value: String(
            warehouse.value ??
            warehouse.id,
          ),

          label:
            warehouse.label ??
            warehouse.name ??
            warehouse.warehouse_name ??
            `Warehouse ${warehouse.id ??
            warehouse.value ??
            ""
            }`,
        }),
      );
    }, [
      sourceWarehouses,
    ]);

  /* =======================================================
     LOCATION OPTIONS
  ======================================================= */

  const locationOptions =
    useMemo(() => {
      if (!warehouseId) {
        return [];
      }

      return sourceLocations
        .filter(
          (location) => {
            const locationWarehouseId =
              location.warehouseId ??
              location.warehouse_id ??
              location.warehouse?.id;

            /*
             * dataLayer lookups may already
             * be mapped. If warehouse info
             * isn't included, don't remove
             * that location from the list.
             */
            if (
              locationWarehouseId ===
              undefined ||
              locationWarehouseId ===
              null
            ) {
              return true;
            }

            return (
              String(
                locationWarehouseId,
              ) ===
              String(
                warehouseId,
              )
            );
          },
        )
        .map(
          (location) => ({
            value: String(
              location.value ??
              location.id,
            ),

            label:
              location.label ??
              location.name ??
              location.location_name ??
              `Location ${location.id ??
              location.value ??
              ""
              }`,
          }),
        );
    }, [
      sourceLocations,
      warehouseId,
    ]);

  /* =======================================================
     USER OPTIONS
  ======================================================= */

  const userOptions = useMemo(() => {
    const options = sourceUsers.map((user) => ({
      value: String(
        user.value ??
        user.id
      ),

      label:
        user.label ??
        user.name ??
        user.full_name ??
        user.email ??
        `User ${user.id ?? user.value ?? ""}`,
    }));

    /*
     * In edit mode, make sure the currently
     * assigned counter is available even if
     * the users lookup doesn't contain them.
     */
    if (
      isEditing &&
      assignedCounter &&
      assignedCounterName &&
      !options.some(
        (option) =>
          String(option.value) ===
          String(assignedCounter)
      )
    ) {
      options.unshift({
        value: String(assignedCounter),
        label: assignedCounterName,
      });
    }

    return options;
  }, [
    sourceUsers,
    isEditing,
    assignedCounter,
    assignedCounterName,
  ]);

  /* =======================================================
     PRIORITY META
  ======================================================= */

  function handleAssignedCounterChange(value) {
    setAssignedCounter(value);

    const selectedUser = userOptions.find(
      (user) =>
        String(user.value) === String(value)
    );

    setAssignedCounterName(
      selectedUser?.label ?? ""
    );
  }

  const priorityMeta =
    PRIORITIES.find(
      (item) =>
        item.value ===
        priority,
    );

  /* =======================================================
     LOAD FORM

     CREATE:
     resets to defaults.

     EDIT:
     loads the values passed from
     StockCountDetails.openEdit().
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    if (
      isEditing &&
      initialForm
    ) {
      setWarehouseId(
        initialForm.warehouse !==
          undefined &&
          initialForm.warehouse !==
          null
          ? String(
            initialForm.warehouse,
          )
          : "",
      );

      setLocationId(
        initialForm.location !==
          undefined &&
          initialForm.location !==
          null
          ? String(
            initialForm.location,
          )
          : "",
      );

      setCountType(
        initialForm.countType ??
        initialForm.count_type ??
        "",
      );

      setPriority(
        String(
          initialForm.priority ??
          "medium",
        ).toLowerCase(),
      );

      setScheduledDate(
        (
          initialForm.scheduledDate ??
          initialForm.count_date ??
          getLocalDate()
        )
          .toString()
          .slice(0, 10),
      );

      setStartTime(
        initialForm.startTime ??
        initialForm.start_time ??
        "",
      );

      setAssignedCounter(
        initialForm.assignedCounter !==
          undefined &&
          initialForm.assignedCounter !==
          null
          ? String(
            initialForm.assignedCounter,
          )
          : initialForm.assigned_to !==
            undefined &&
            initialForm.assigned_to !==
            null
            ? String(
              initialForm.assigned_to,
            )
            : "",
      );

      setAssignedCounterName(
        initialForm.assignedCounterName ?? ""
      );

      setNotes(
        initialForm.notes ??
        "",
      );

      setSaveError("");

      return;
    }

    resetForm();
  }, [
    open,
    isEditing,
    initialForm,
  ]);

  /* =======================================================
     WAREHOUSE CHANGE

     Only clear location when the USER
     changes the warehouse.

     This is important in edit mode so
     the prefilled location is not lost.
  ======================================================= */

  function handleWarehouseChange(
    value,
  ) {
    setWarehouseId(
      value,
    );

    setLocationId("");
  }

  /* =======================================================
     RESET FORM
  ======================================================= */

  function resetForm() {
    setWarehouseId("");

    setLocationId("");

    setCountType("");

    setPriority(
      "medium",
    );

    setScheduledDate(
      getLocalDate(),
    );

    setStartTime("");

    setAssignedCounter("");
    setAssignedCounterName("");

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

    if (
      notes.length > 500
    ) {
      return "Notes cannot exceed 500 characters.";
    }

    return null;
  }

  /* =======================================================
     BUILD FORM VALUES

     Includes both the display-oriented
     names used by dataLayer and the raw
     backend names.
  ======================================================= */

  function buildForm() {
    const warehouseValue =
      Number(
        warehouseId,
      );

    const locationValue =
      locationId
        ? Number(
          locationId,
        )
        : null;

    const counterValue =
      Number(
        assignedCounter,
      );

    return {
      /*
       * dataLayer names
       */
      warehouse:
        warehouseValue,

      location:
        locationValue,

      countType,

      scheduledDate,

      startTime:
        startTime || "",

      assignedCounter:
        counterValue,

      /*
       * backend/API names
       */
      warehouse_id:
        warehouseValue,

      warehouse_location_id:
        locationValue,

      count_type:
        countType,

      priority,

      count_date:
        scheduledDate,

      start_time:
        startTime ||
        null,

      assigned_to:
        counterValue,

      notes:
        notes.trim() ||
        null,
    };
  }

  /* =======================================================
     EXTRACT API ERROR
  ======================================================= */

  function getErrorMessage(
    err,
    fallback,
  ) {
    const message =
      err?.response?.data
        ?.message;

    const errors =
      err?.response?.data
        ?.errors;

    if (message) {
      return message;
    }

    if (
      errors &&
      typeof errors ===
      "object"
    ) {
      const combined =
        Object.values(
          errors,
        )
          .flat()
          .filter(Boolean)
          .join(" ");

      if (combined) {
        return combined;
      }
    }

    return (
      err?.message ??
      fallback
    );
  }

  /* =======================================================
     SUBMIT

     CREATE:
       createStockCount()

     EDIT:
       onSave()
       → StockCountDetails.handleEditSave()
       → apiUpdateStockCount()
       → PUT /stock-counts/{id}
  ======================================================= */

  async function handleSubmit() {
    const validationError =
      validate();

    if (
      validationError
    ) {
      setSaveError(
        validationError,
      );

      return;
    }

    const form =
      buildForm();

    try {
      setSaving(true);

      setSaveError("");

      /* ===============================================
         EDIT MODE
      =============================================== */

      if (isEditing) {
        if (
          typeof onSave !==
          "function"
        ) {
          throw new Error(
            "No save handler was provided for editing this stock count.",
          );
        }

        await onSave(
          form,
        );

        return;
      }

      /* ===============================================
         CREATE MODE
      =============================================== */

      const payload = {
        warehouse_id:
          form.warehouse_id,

        warehouse_location_id:
          form.warehouse_location_id,

        count_type:
          form.count_type,

        priority:
          form.priority,

        count_date:
          form.count_date,

        start_time:
          form.start_time,

        assigned_to:
          form.assigned_to,

        notes:
          form.notes,
      };

      const created =
        await StockCountApi.createStockCount(
          payload,
        );

      resetForm();

      onCreated?.(
        created,
      );
    } catch (err) {
      setSaveError(
        getErrorMessage(
          err,
          isEditing
            ? "Couldn't save the stock count."
            : "Couldn't create the stock count.",
        ),
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
              {isEditing
                ? "Edit Stock Count"
                : "New Stock Count"}
            </h2>

            <p
              className="
                mt-1
                text-[15px]
                text-slate-500
              "
            >
              {isEditing
                ? "Update the information for this stock count."
                : "Create a new stock count to record physical inventory."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            closeModal
          }
          disabled={
            saving
          }
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
              value={
                warehouseId
              }
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
              value={
                locationId
              }
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
              Specific area for this
              count (optional).
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
              value={
                countType
              }
              onChange={
                setCountType
              }
              placeholder="Select count type"
              options={
                countTypes
              }
            />

            <HelperText>
              Choose the type of
              stock count you want
              to perform.
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
                value={
                  priority
                }
                onChange={(
                  event,
                ) =>
                  setPriority(
                    event.target
                      .value,
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
                  ),
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
                  ${priorityMeta?.dot ??
                  ""
                  }
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
              Set the priority level
              for this count.
            </HelperText>
          </div>

          {/* =============================================
              SCHEDULED DATE
          ============================================= */}

          <div>
            <FieldLabel required>
              Scheduled Date
            </FieldLabel>

            <input
              type="date"
              value={scheduledDate}
              onChange={(event) =>
                setScheduledDate(event.target.value)
              }
              className="
    h-12
    w-full
    rounded-xl
    border
    border-slate-200
    px-4
    text-[14px]
    text-slate-800
    outline-none
    focus:border-blue-500
    focus:ring-2
    focus:ring-blue-100
  "
            />
          </div>

          {/* =============================================
              START TIME
          ============================================= */}

          <div>
            <FieldLabel>
              Start Time
            </FieldLabel>

            <input
              type="time"
              value={startTime}
              onChange={(event) =>
                setStartTime(event.target.value)
              }
              className="
    h-12
    w-full
    rounded-xl
    border
    border-slate-200
    px-4
    text-[14px]
    text-slate-800
    outline-none
    focus:border-blue-500
    focus:ring-2
    focus:ring-blue-100
  "
            />
          </div>

          {/* =============================================
              ASSIGNED COUNTER
          ============================================= */}

          <div className="md:col-span-2">
            <FieldLabel required>
              Assigned Counter
            </FieldLabel>

            <SelectField
              value={assignedCounter}
              onChange={handleAssignedCounterChange}
              placeholder={
                usersLoading
                  ? "Loading users..."
                  : "Select user"
              }
              options={userOptions}
              disabled={usersLoading}
            />

            <HelperText>
              Person responsible for
              conducting this count.
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
              value={
                notes
              }
              maxLength={500}
              onChange={(
                event,
              ) =>
                setNotes(
                  event.target
                    .value,
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
                {isEditing
                  ? "Editing this stock count"
                  : "What happens next?"}
              </p>

              <p
                className="
                  mt-0.5
                  text-[13px]
                  text-blue-600
                "
              >
                {isEditing
                  ? "Save your changes to update this stock count. Existing count items will not be removed."
                  : "After creating the stock count, you can add items and begin the counting process."}
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

        {/* CREATE / SAVE */}

        <button
          type="button"
          onClick={
            handleSubmit
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
          ) : isEditing ? (
            <Save
              size={17}
            />
          ) : (
            <Plus
              size={18}
            />
          )}

          {saving
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Create Stock Count"}
        </button>
      </div>
    </Modal>
  );
}