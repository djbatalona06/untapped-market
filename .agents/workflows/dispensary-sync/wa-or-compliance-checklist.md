# WA + OR Cannabis Compliance Checklist — Agent Reference

## Purpose
After each daily menu pull, the compliance agent validates that displayed product data
meets WA WSLCB and OR OLCC lab reporting standards. Non-compliant listings are flagged
before they surface to Untapped Market users.

---

## Washington State (WSLCB)

### Governing authority
Washington State Liquor and Cannabis Board (WSLCB)
- Public rules: WAC 314-55 (retailer), WAC 314-55-102 (lab testing)
- Enforcement data: https://lcb.wa.gov/enforcement/marijuana-enforcement

### Required lab data per product listing
| Field | Requirement | Source |
|-------|-------------|--------|
| THC (mg or %) | Mandatory on label | COA from WSLCB-accredited lab |
| CBD (mg or %) | Mandatory on label | COA |
| Terpene profile | Optional but encouraged | COA |
| Pesticide screen | Must PASS (>60 analytes per WAC 314-55-102) | COA |
| Heavy metals | Must PASS (As, Cd, Hg, Pb) | COA |
| Microbial | Must PASS (Salmonella, E.coli, Aspergillus) | COA |
| Moisture content | Flower only: ≤15% | COA |
| Batch/lot number | Required for traceability | Label |

### Traceability system
- BioTrackTHC (state-mandated seed-to-sale)
- Each product has a global trade item number (GTIN) or state-assigned ID
- Compliance pull: check https://traceability.lcb.wa.gov (public recall/advisory feed)

### License types relevant to Untapped Market
- I-502 Retailer (3rd tier) — can sell to consumers
- Medical endorsement — additional product categories allowed

### Compliance check steps (WA)
1. For each WA dispensary menu item:
   - Verify THC% is present and ≤100%
   - Verify pesticide/heavy metal pass status (from public COA if linked, or flag as "unverified")
   - Check WSLCB recall feed for matching batch numbers
   - Verify retailer license is still active (WSLCB licensee lookup)
2. Flag any product with missing mandatory fields as `compliance_status: "needs_review"`
3. Flag any product whose dispensary license shows "suspended" or "revoked"

---

## Oregon (OLCC)

### Governing authority
Oregon Liquor and Cannabis Commission (OLCC)
- Public rules: OAR 845-025 (recreational marijuana)
- Lab standards: OAR 333-064 (OHA lab testing rules)
- License search: https://apps.oregon.gov/OLCC/Licensing/

### Required lab data per product listing
| Field | Requirement | Source |
|-------|-------------|--------|
| THC (%) | Mandatory | COA from ORELAP-accredited lab |
| CBD (%) | Mandatory | COA |
| Total cannabinoids | Mandatory | COA |
| Terpenes | Mandatory for flower/concentrate since 2023 | COA |
| Pesticide screen | PASS required (OAR 333-064-0100) | COA |
| Heavy metals | PASS required | COA |
| Residual solvents | Concentrates only — PASS required | COA |
| Water activity | Flower/edibles — specific limits | COA |
| Batch number | Required (links to Metrc) | Label |

### Traceability system
- Metrc (mandatory for OR licensees)
- Recall feed: https://www.oregon.gov/olcc/marijuana/Pages/Recalls.aspx

### OR vs WA key differences
| Item | WA | OR |
|------|----|----|
| Terpene reporting | Optional | Mandatory (flower/concentrate) since 2023 |
| Lab accreditation body | WSLCB-approved labs | ORELAP (Oregon Health Authority) |
| Traceability | BioTrackTHC | Metrc |
| Edible THC limit | 10mg/serving, 100mg/package | 5mg/serving, 50mg/package |
| Residual solvent scope | WAC 314-55-102 | OAR 333-064-0100 (stricter for BHO) |

### Compliance check steps (OR)
1. For each OR dispensary menu item:
   - Verify THC% AND terpene data present for flower/concentrate
   - Verify edible serving sizes ≤5mg THC
   - Check OLCC recall feed for matching batch
   - Verify retailer license active via OLCC lookup
2. Flag any concentrate missing residual solvent data as `compliance_status: "needs_review"`
3. Flag any edible with >5mg/serving as `compliance_status: "violation_risk"`

---

## Agent compliance pull procedure

```
1. After menu sync completes, for each product record:
   a. Determine state (WA or OR) from dispensary.state
   b. Run state-appropriate checks above
   c. Set product.compliance_status = "pass" | "needs_review" | "violation_risk"
   d. Set product.last_compliance_check = ISO timestamp

2. Fetch recall feeds:
   - WA: https://lcb.wa.gov/enforcement/marijuana-enforcement (scan for "recall")
   - OR: https://www.oregon.gov/olcc/marijuana/Pages/Recalls.aspx
   - Cross-reference batch numbers in local product records
   - Flag any match as compliance_status: "RECALLED" — do not display to users

3. Write compliance summary to:
   Untapped-market/src/data/sync-logs/YYYY-MM-DD-compliance.json
```

---

## Budget note
> Actual legal review of OR/WA licensing data requires a cannabis compliance attorney
> licensed in each state. OLCC rules change ~quarterly; WSLCB emergency rules can take
> effect in 7 days. Budget minimum 4hrs/month attorney time per state for rule change monitoring.
> This automated check is a first-pass filter, not a legal opinion.

## Key contacts
- WA WSLCB Licensing: 360-664-1600 | wslcb@lcb.wa.gov
- OR OLCC Cannabis: 503-872-5000 | marijuana.licensing@oregon.gov
