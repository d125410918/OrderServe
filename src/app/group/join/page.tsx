"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, UserRound } from "lucide-react";
import { PageHeader } from "@/presentation/components/page-header";
import { useOrder } from "@/presentation/providers/order-provider";

export default function JoinRoomPage() {
  const router = useRouter();
  const { state, createRoom } = useOrder();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  return <main className="page-gradient"><PageHeader title="加入一起點房間" subtitle="輸入房號即可加入，不必註冊會員。" /><section className="page-card"><div className="page-card__body form-grid"><div className="form-row"><Hash /><label htmlFor="roomCode">六碼房號</label><input id="roomCode" value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))} placeholder="例如 482761" /></div><div className="form-row"><UserRound /><label htmlFor="participantName">顯示名稱（選填）</label><input id="participantName" value={name} onChange={(event) => setName(event.target.value)} placeholder="未填將產生匿名名稱" /></div></div></section><div style={{ width: "min(920px, calc(100% - 28px))", margin: "0 auto" }}><button className="button button--primary button--block" disabled={code.length !== 6} onClick={() => { createRoom({ code, hostName: name, deadlineAt: Date.now() + 15 * 60_000, branchId: state.branchId, mode: state.mode }); router.push("/group/room"); }}>加入房間</button></div></main>;
}
