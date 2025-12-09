import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  user: any;
};

const ApplyLeave = ({ user }: Props) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Annual Leave
  const [annualFromDate, setAnnualFromDate] = useState("");
  const [annualToDate, setAnnualToDate] = useState("");
  const [replacementEmp, setReplacementEmp] = useState("");

  // Accidental Leave
  const [accidentalFromDate, setAccidentalFromDate] = useState("");
  const [accidentalToDate, setAccidentalToDate] = useState("");

  // Medical Leave
  const [medicalFromDate, setMedicalFromDate] = useState("");
  const [medicalToDate, setMedicalToDate] = useState("");
  const [medicalType, setMedicalType] = useState("");
  const [insuranceStatus, setInsuranceStatus] = useState(false);
  const [disabilityDetails, setDisabilityDetails] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [fileName, setFileName] = useState("");

  // Unpaid Leave
  const [unpaidFromDate, setUnpaidFromDate] = useState("");
  const [unpaidToDate, setUnpaidToDate] = useState("");
  const [unpaidDocDescription, setUnpaidDocDescription] = useState("");
  const [unpaidFileName, setUnpaidFileName] = useState("");

  // Compensation Leave
  const [compensationDate, setCompensationDate] = useState("");
  const [reason, setReason] = useState("");
  const [dateOfOriginalWorkday, setDateOfOriginalWorkday] = useState("");
  const [compReplacementEmp, setCompReplacementEmp] = useState("");

  const handleAnnualLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!annualFromDate || !annualToDate || !replacementEmp.trim()) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }
    if (new Date(annualFromDate) > new Date(annualToDate)) {
      setMessage({ type: "error", text: "From date must be before to date" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/academic/leaves/annual/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: user.id,
          replacementEmp: parseInt(replacementEmp),
          fromDate: annualFromDate,
          toDate: annualToDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setAnnualFromDate("");
        setAnnualToDate("");
        setReplacementEmp("");
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleAccidentalLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!accidentalFromDate || !accidentalToDate) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }
    if (new Date(accidentalFromDate) > new Date(accidentalToDate)) {
      setMessage({ type: "error", text: "From date must be before to date" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/academic/leaves/accidental/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: user.id,
          fromDate: accidentalFromDate,
          toDate: accidentalToDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setAccidentalFromDate("");
        setAccidentalToDate("");
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleMedicalLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!medicalFromDate || !medicalToDate || !medicalType || !documentDescription || !fileName) {
      setMessage({ type: "error", text: "All required fields must be filled" });
      return;
    }
    if (new Date(medicalFromDate) > new Date(medicalToDate)) {
      setMessage({ type: "error", text: "From date must be before to date" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/academic/leaves/medical/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: user.id,
          fromDate: medicalFromDate,
          toDate: medicalToDate,
          medicalType,
          insuranceStatus,
          disabilityDetails: disabilityDetails.trim() || null,
          documentDescription,
          fileName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setMedicalFromDate("");
        setMedicalToDate("");
        setMedicalType("");
        setInsuranceStatus(false);
        setDisabilityDetails("");
        setDocumentDescription("");
        setFileName("");
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleUnpaidLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!unpaidFromDate || !unpaidToDate || !unpaidDocDescription || !unpaidFileName) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }
    if (new Date(unpaidFromDate) > new Date(unpaidToDate)) {
      setMessage({ type: "error", text: "From date must be before to date" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/academic/leaves/unpaid/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: user.id,
          fromDate: unpaidFromDate,
          toDate: unpaidToDate,
          documentDescription: unpaidDocDescription,
          fileName: unpaidFileName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setUnpaidFromDate("");
        setUnpaidToDate("");
        setUnpaidDocDescription("");
        setUnpaidFileName("");
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCompensationLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!compensationDate || !reason || !dateOfOriginalWorkday || !compReplacementEmp) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/academic/leaves/compensation/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: user.id,
          compensationDate,
          reason,
          dateOfOriginalWorkday,
          replacementEmp: parseInt(compReplacementEmp),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setCompensationDate("");
        setReason("");
        setDateOfOriginalWorkday("");
        setCompReplacementEmp("");
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Apply for Leave</h2>
      
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <Tabs defaultValue="annual" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="annual">Annual</TabsTrigger>
          <TabsTrigger value="accidental">Accidental</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
        </TabsList>

        <TabsContent value="annual">
          <form className="space-y-4 mt-4" onSubmit={handleAnnualLeave}>
            <div>
              <label className="block mb-1 font-medium">From Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={annualFromDate}
                onChange={e => setAnnualFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">To Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={annualToDate}
                onChange={e => setAnnualToDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Replacement Employee ID</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                placeholder="Employee ID to replace you"
                value={replacementEmp}
                onChange={e => setReplacementEmp(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Annual Leave"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="accidental">
          <form className="space-y-4 mt-4" onSubmit={handleAccidentalLeave}>
            <div>
              <label className="block mb-1 font-medium">From Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={accidentalFromDate}
                onChange={e => setAccidentalFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">To Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={accidentalToDate}
                onChange={e => setAccidentalToDate(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Accidental Leave"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="medical">
          <form className="space-y-4 mt-4" onSubmit={handleMedicalLeave}>
            <div>
              <label className="block mb-1 font-medium">From Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={medicalFromDate}
                onChange={e => setMedicalFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">To Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={medicalToDate}
                onChange={e => setMedicalToDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Medical Type</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={medicalType}
                onChange={e => setMedicalType(e.target.value)}
              >
                <option value="">Select medical type</option>
                <option value="sick">Sick</option>
                <option value="maternity">Maternity</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="insurance"
                checked={insuranceStatus}
                onChange={e => setInsuranceStatus(e.target.checked)}
              />
              <label htmlFor="insurance" className="font-medium">Insurance Coverage</label>
            </div>
            <div>
              <label className="block mb-1 font-medium">Disability Details (Optional)</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="If applicable"
                value={disabilityDetails}
                onChange={e => setDisabilityDetails(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Document Description</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="memo"
                value={documentDescription}
                onChange={e => setDocumentDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">File Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="medical_certificate.pdf"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Medical Leave"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="unpaid">
          <form className="space-y-4 mt-4" onSubmit={handleUnpaidLeave}>
            <div>
              <label className="block mb-1 font-medium">From Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={unpaidFromDate}
                onChange={e => setUnpaidFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">To Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={unpaidToDate}
                onChange={e => setUnpaidToDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Document Description</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="memo"
                value={unpaidDocDescription}
                onChange={e => setUnpaidDocDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">File Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="document.pdf"
                value={unpaidFileName}
                onChange={e => setUnpaidFileName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Unpaid Leave"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="compensation">
          <form className="space-y-4 mt-4" onSubmit={handleCompensationLeave}>
            <div>
              <label className="block mb-1 font-medium">Compensation Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={compensationDate}
                onChange={e => setCompensationDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Date of Original Workday</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={dateOfOriginalWorkday}
                onChange={e => setDateOfOriginalWorkday(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Reason</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Reason for compensation"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Replacement Employee ID</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                placeholder="Employee ID to replace you"
                value={compReplacementEmp}
                onChange={e => setCompReplacementEmp(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Compensation Leave"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplyLeave;