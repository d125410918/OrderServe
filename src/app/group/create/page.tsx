"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Copy, Hash, Link2, LockKeyhole, MapPin, QrCode, Store, UserRound, WalletCards } from "lucide-react";
import { branches } from "@/infrastructure/mock/catalog";
import { PageHeader } from "@/presentation/components/page-header";
import { ModeSwitcher } from "@/presentation/components/mode-switcher";
import { useOrder } from "@/presentation/providers/order-provider";

function generateRoomCode(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export default function CreateGroupRoomPage() {
  const router = useRouter();
  const { state, setBranch, setMode, createRoom } = useOrder();
  const [hostName, setHostName] = useState("");
  const [address, setAddress] = useState("台北市信義區松壽路 12 號");
  const [deadlineMinutes, setDeadlineMinutes] = useState(15);
  const [password, setPassword] = useState("");
  const [personLimit, setPersonLimit] = useState("");
  const [roomLimit, setRoomLimit] = useState("");
  const [code, setCode] = useState("482761");
  useEffect(() => setCode(generateRoomCode()), []);

  function submit() {
    createRoom({ code, hostName, deadlineAt: Date.now() + deadlineMinutes * 60_000, branchId: state.branchId, mode: state.mode });
    router.push("/group/room");
  }

  return (
    <main className="page-gradient">
      <PageHeader title="建立一起點房間" subtitle="建立房間並分享給朋友，一起點餐更方便。" />
      <section className="page-card">
        <div className="page-card__body form-grid">
          <div className="form-row"><Store /><label htmlFor="branch">分店</label><select id="branch" value={state.branchId} onChange={(event) => setBranch(event.target.value)}>{branches.map((branch) => <option value={branch.id} key={branch.id}>{branch.name}</option>)}</select></div>
          <div className="form-row"><MapPin /><span className="form-row__label">取餐方式</span><ModeSwitcher compact value={state.mode} onChange={setMode} /></div>
          <div className="form-row"><Hash /><span className="form-row__label">房號（自動產生）</span><strong style={{ textAlign: "right", color: "var(--red-700)", fontSize: "1.35rem" }}>{code}</strong></div>
          <div className="form-row"><UserRound /><label htmlFor="hostName">發起人名稱</label><input id="hostName" value={hostName} onChange={(event) => setHostName(event.target.value)} placeholder="選填，未填顯示匿名房主" /></div>
          <div className="form-row"><MapPin /><label htmlFor="address">地址或取餐資訊</label><input id="address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="請輸入地址或取餐資訊" /></div>
          <div className="form-row"><Clock3 /><label htmlFor="sendTime">預計送出時間</label><input id="sendTime" type="time" defaultValue="12:30" /></div>
          <div className="form-row"><Clock3 /><label htmlFor="deadline">加入截止時間</label><select id="deadline" value={deadlineMinutes} onChange={(event) => setDeadlineMinutes(Number(event.target.value))}><option value={10}>10 分鐘</option><option value={15}>15 分鐘</option><option value={20}>20 分鐘</option><option value={30}>30 分鐘</option></select></div>
          <div className="form-row"><LockKeyhole /><label htmlFor="password">房間密碼（選填）</label><input id="password" type="password" inputMode="numeric" value={password} onChange={(event) => setPassword(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="4–8 位數字" /></div>
          <div className="form-row"><UserRound /><label htmlFor="personLimit">每人金額上限（選填）</label><input id="personLimit" inputMode="numeric" value={personLimit} onChange={(event) => setPersonLimit(event.target.value.replace(/\D/g, ""))} placeholder="請輸入金額" /></div>
          <div className="form-row"><WalletCards /><label htmlFor="roomLimit">房間總額上限（選填）</label><input id="roomLimit" inputMode="numeric" value={roomLimit} onChange={(event) => setRoomLimit(event.target.value.replace(/\D/g, ""))} placeholder="請輸入金額" /></div>
        </div>
      </section>
      <section className="page-card"><div className="page-card__body inline-toggle"><div><strong>可查看其他人餐點</strong><p className="muted" style={{ margin: "4px 0 0" }}>所有成員可查看彼此已提交的餐點與金額。</p></div><input className="toggle" type="checkbox" defaultChecked aria-label="允許查看其他人餐點" /></div></section>
      <section className="page-card"><div className="page-card__header"><div><h3>分享房間給朋友</h3><span className="muted">房間建立後可同時使用所有分享方式</span></div></div><div className="page-card__body share-grid"><button type="button" className="share-button"><Link2 />分享連結</button><button type="button" className="share-button"><QrCode />QR Code</button><button type="button" className="share-button"><Copy />複製房號</button></div></section>
      <div style={{ width: "min(920px, calc(100% - 28px))", margin: "0 auto" }}><button type="button" onClick={submit} className="button button--primary button--block" style={{ minHeight: 58 }}>建立房間</button></div>
    </main>
  );
}
