import { useRef } from "react";

export default function SettingsRightPanel({
  form,
  warehouses,
  auditLogCount,
  onViewLogs,
  showToast,
  onUploadCompanyLogo,
  uploadingLogo,
}) {
  const logoInputRef = useRef(null);

  const actions = [
    [
      "Backup Now",
      "Create a backup of your data now",
      "#4f6ef7",
      false,
    ],
    [
      "Restore from Backup",
      "Restore data from a previous backup",
      "#f59e0b",
      false,
    ],
    [
      "Clear Cache",
      "Improve system performance",
      "#8b5cf6",
      false,
    ],
    [
      "View System Logs",
      "View system activity logs",
      "#22c27e",
      true,
    ],
  ];

  const handleAction = (action) => {
    if (!action[3]) {
      showToast?.(
        `${action[0]} isn't available yet - no matching endpoint`,
      );
      return;
    }

    onViewLogs?.();
  };

  const handleLogoClick = () => {
    if (uploadingLogo) {
      return;
    }

    logoInputRef.current?.click();
  };

  const handleLogoSelected = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showToast?.(
        "Please select a JPG, PNG, or WebP image",
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast?.(
        "Company logo must not exceed 5 MB",
      );

      event.target.value = "";
      return;
    }

    try {
      await onUploadCompanyLogo?.(file);
    } finally {
      /*
       * Reset the input so the same image
       * can be selected again if necessary.
       */
      event.target.value = "";
    }
  };

  return (
    <div
      className="st-right"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Company Information */}
      <div style={panelStyle}>
        <div style={headStyle}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 13.5,
              color: "#1e2740",
            }}
          >
            Company Information
          </span>
        </div>

        <div
          style={{
            padding: "18px 18px 6px",
          }}
        >
          {/* Hidden file picker */}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleLogoSelected}
            style={{
              display: "none",
            }}
          />

          {/* Company logo */}
          <button
            type="button"
            onClick={handleLogoClick}
            disabled={uploadingLogo}
            title={
              form.companyLogo
                ? "Change company logo"
                : "Upload company logo"
            }
            style={{
              width: 56,
              height: 56,
              background: "#f4f6fb",
              border: "1px solid #e4e7ef",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              padding: 0,
              position: "relative",
              overflow: "hidden",
              cursor: uploadingLogo
                ? "wait"
                : "pointer",
              fontFamily: "inherit",
            }}
          >
            {form.companyLogo ? (
              <img
                src={form.companyLogo}
                alt="Company logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: 5,
                  boxSizing: "border-box",
                }}
              />
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9aa1b4"
                strokeWidth="1.5"
              >
                <rect
                  x="2"
                  y="7"
                  width="20"
                  height="14"
                  rx="2"
                />

                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            )}

            {/* Uploading overlay */}
            {uploadingLogo && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(255,255,255,0.88)",
                  color: "#4f6ef7",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                Uploading...
              </div>
            )}

            {/* Hover/edit indicator */}
            {!uploadingLogo &&
              form.companyLogo && (
                <div
                  className="company-logo-edit"
                  style={{
                    position: "absolute",
                    right: 3,
                    bottom: 3,
                    width: 18,
                    height: 18,
                    borderRadius: 6,
                    background: "#4f6ef7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #fff",
                  }}
                >
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </div>
              )}
          </button>

          <div
            style={{
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#1e2740",
              }}
            >
              {form.companyName || "Not set"}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#9aa1b4",
                marginTop: 3,
              }}
            >
              Enterprise Inventory Management
            </div>
          </div>

          {[
            [
              "Email",
              form.companyEmail || "Not set",
            ],
            [
              "Phone",
              form.companyPhone || "Not set",
            ],
          ].map(([label, val]) => (
            <div
              key={label}
              style={{
                display: "flex",
                gap: 8,
                padding: "8px 0",
                borderTop:
                  "1px solid #f4f6fb",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#9aa1b4",
                  width: 55,
                  flexShrink: 0,
                }}
              >
                {label}
              </span>

              <span
                style={{
                  fontSize: 12,
                  color: "#1e2740",
                  wordBreak: "break-all",
                }}
              >
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System Details */}
      <div
        style={{
          ...panelStyle,
          padding: 18,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 13.5,
            color: "#1e2740",
            marginBottom: 14,
          }}
        >
          System Details
        </div>

        {[
          [
            "Audit Log Entries",
            auditLogCount !== null
              ? String(auditLogCount)
              : "-",
          ],
          [
            "Warehouses",
            String(warehouses.length),
          ],
        ].map(([label, val]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "flex-start",
              padding: "8px 0",
              borderBottom:
                "1px solid #f4f6fb",
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#9aa1b4",
              }}
            >
              {label}
            </span>

            <span
              style={{
                fontSize: 12,
                color: "#1e2740",
                fontWeight: 500,
                textAlign: "right",
                maxWidth: 140,
              }}
            >
              {val}
            </span>
          </div>
        ))}

        <div
          style={{
            fontSize: 11,
            color: "#c9cedd",
            marginTop: 8,
          }}
        >
          Version, environment and backup info
          aren't exposed by the API yet.
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          ...panelStyle,
          padding: 18,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 13.5,
            color: "#1e2740",
            marginBottom: 14,
          }}
        >
          Actions
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {actions.map((action) => (
            <button
              key={action[0]}
              type="button"
              onClick={() =>
                handleAction(action)
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                border:
                  "1px solid #f4f6fb",
                borderRadius: 9,
                background: "#fff",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                width: "100%",
                opacity: action[3]
                  ? 1
                  : 0.55,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#f4f6fb",
                }}
              />

              <div>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: action[2],
                    marginBottom: 2,
                  }}
                >
                  {action[0]}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: "#9aa1b4",
                  }}
                >
                  {action[3]
                    ? action[1]
                    : "Not available - no matching endpoint"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const panelStyle = {
  background: "#fff",
  border: "1px solid #e4e7ef",
  borderRadius: 12,
  overflow: "hidden",
};

const headStyle = {
  padding: "14px 18px",
  borderBottom: "1px solid #e4e7ef",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};
