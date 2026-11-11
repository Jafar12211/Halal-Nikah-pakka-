import type { LanguageCode } from '../types/database';
import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Lock,
  ShieldCheck,
  Users,
  AlertTriangle,
  Phone,
  Sparkles,
  CheckCheck,
  MessageSquare
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Conversation, Message, UserAccount } from '../types/database';

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  targetConversationId?: string;
  language: LanguageCode;
}

export const MessagingModal: React.FC<MessagingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetConversationId,
  language,
}) => {
  const isTelugu = language === 'te';
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [senderRole, setSenderRole] = useState<'candidate' | 'wali' | 'parent'>('candidate');
  const [waliMonitored, setWaliMonitored] = useState(true);
  const [blockReportToast, setBlockReportToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      const convs = storageService.getConversations(currentUser.id);
      setConversations(convs);
      if (targetConversationId && convs.some((c) => c.id === targetConversationId)) {
        setActiveConvId(targetConversationId);
      } else if (convs.length > 0) {
        setActiveConvId(convs[0].id);
      }
    }
  }, [isOpen, currentUser, targetConversationId]);

  useEffect(() => {
    if (activeConvId) {
      const msgs = storageService.getMessages(activeConvId);
      setMessages(msgs);
    }
  }, [activeConvId]);

  if (!isOpen) return null;

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConvId || !currentUser) return;

    const newMsg = storageService.sendMessage(
      activeConvId,
      currentUser.id,
      senderRole === 'wali' ? `${currentUser.name} (Wali / Guardian)` : currentUser.name,
      senderRole,
      text.trim()
    );

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // refresh conversation list snippet
    const convs = storageService.getConversations(currentUser.id);
    setConversations(convs);
  };

  const handleBlockUser = () => {
    setBlockReportToast(
      isTelugu ? 'బ్లాక్ ఫీచర్ ఇంకా అందుబాటులో లేదు. ఎవరూ బ్లాక్ కాలేదు.' : 'Blocking is not connected yet. No one has been blocked.'
    );
    setTimeout(() => {
      setBlockReportToast(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white w-full max-w-4xl h-[620px] rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="bg-emerald-950 text-white px-6 py-3.5 flex items-center justify-between border-b border-emerald-900 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <h3 className="font-serif font-bold text-sm text-white">
              {isTelugu ? 'నికాహ్ పక్కా - కుటుంబ పర్యవేక్షణ సంభాషణ' : 'Nikah Pakka Family Messaging Preview'}
            </h3>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-800">
              <Lock className="w-3 h-3 text-amber-300" />
              Not yet enabled
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-stone-300 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Conversations Thread List */}
          <div className="w-1/3 border-r border-stone-200 bg-stone-50 flex flex-col overflow-y-auto hidden sm:flex">
            <div className="p-3 border-b border-stone-200 text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center justify-between">
              <span>{isTelugu ? 'సంభాషణలు' : 'Conversations'}</span>
              <span className="text-stone-400 font-normal">({conversations.length})</span>
            </div>

            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">
                {isTelugu ? 'సంభాషణలు ఏవీ లేవు' : 'No active chats. Express interest in a profile to begin.'}
              </div>
            ) : (
              <div className="divide-y divide-stone-200">
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  const otherName =
                    currentUser?.name === conv.profileAName ? conv.profileBName : conv.profileAName;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`w-full text-left p-3.5 transition-colors ${
                        isActive ? 'bg-emerald-50/80 border-l-4 border-emerald-800' : 'hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif font-bold text-xs text-stone-900 truncate">
                          {otherName}
                        </span>
                        <span className="text-[10px] text-stone-400">{conv.lastMessageAt}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{conv.lastMessage}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
                        <Users className="w-3 h-3" />
                        <span>{isTelugu ? 'వలీ సమక్షంలో' : 'Wali Monitored'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Active Chat Window */}
          <div className="flex-1 flex flex-col bg-white">
            {activeConversation ? (
              <>
                {/* Chat Top Banner with Wali Supervision Notice */}
                <div className="p-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-serif font-bold text-xs flex items-center justify-center">
                      {activeConversation.profileBName[0]}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xs text-stone-900">
                        {activeConversation.profileBName}
                      </h4>
                      <p className="text-[10px] text-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        <span>
                          {isTelugu
                            ? 'సంరక్షకుడు (వలీ) పర్యవేక్షణ సక్రియంగా ఉంది'
                            : 'Family Guardian (Wali) Chaperone Active'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={handleBlockUser}
                      className="px-2.5 py-1 text-[11px] text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                    >
                      {isTelugu ? 'బ్లాక్ చేయండి' : 'Block / Report'}
                    </button>
                  </div>
                </div>

                {/* Islamic Privacy Banner */}
                <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-100 text-[11px] text-amber-900 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>
                    {isTelugu
                      ? 'ఖల్వా (ఏకాంతం) లేకుండా కుటుంబ సభ్యుల సమక్షంలో జరిగే పరిశుద్ధ సంభాషణ.'
                      : 'Islamic Etiquette: In-app conversations are monitored by family guardians to prevent Khalwah and uphold modesty.'}
                  </span>
                </div>

                {/* Message Bubbles Container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fdfbf7]">
                  {messages.map((msg) => {
                    const isMe = msg.senderUserId === currentUser?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-stone-500 mb-0.5 px-1 font-medium">
                          {msg.senderName}
                        </span>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-emerald-800 text-white rounded-tr-none'
                              : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                              isMe ? 'text-emerald-200' : 'text-stone-400'
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            {isMe && <CheckCheck className="w-3 h-3 text-amber-300" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Prompts */}
                <div className="px-3 py-2 bg-stone-50 border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <span className="font-semibold text-stone-500 whitespace-nowrap shrink-0">
                    {isTelugu ? 'త్వరిత ప్రశ్నలు:' : 'Quick Inquiries:'}
                  </span>
                  <button
                    onClick={() =>
                      handleSendMessage(
                        isTelugu
                          ? 'నమాజ్ మరియు దీన్ ప్రాధాన్యతల గురించి మరిన్ని వివరాలు తెలియజేయగలరా?'
                          : 'Could you please share your daily Salah and Deen routine?'
                      )
                    }
                    className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded-lg border border-stone-200 whitespace-nowrap shrink-0 transition-colors"
                  >
                    {isTelugu ? 'నమాజ్ & దీన్' : 'Salah Routine'}
                  </button>
                  <button
                    onClick={() =>
                      handleSendMessage(
                        isTelugu
                          ? 'యానాం లేదా గోదావరి జిల్లాల్లో కుటుంబ కలయికకు అనుకూలమైన సమయం చెప్పండి.'
                          : 'Would your family be open to an elder-accompanied meeting in Godavari?'
                      )
                    }
                    className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded-lg border border-stone-200 whitespace-nowrap shrink-0 transition-colors"
                  >
                    {isTelugu ? 'గోదావరి సమావేశం' : 'Godavari Family Meeting'}
                  </button>
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0">
                  <select
                    value={senderRole}
                    onChange={(e) => setSenderRole(e.target.value as any)}
                    className="px-2 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800 shrink-0"
                    title="Speaking as"
                  >
                    <option value="candidate">{isTelugu ? 'అభ్యర్థి' : 'Candidate'}</option>
                    <option value="wali">{isTelugu ? 'వలీ / తండ్రి' : 'Wali / Father'}</option>
                    <option value="parent">{isTelugu ? 'తల్లి / సంరక్షకురాలు' : 'Mother / Elder'}</option>
                  </select>

                  <input
                    type="text"
                    placeholder={
                      isTelugu
                        ? 'గౌరవప్రదమైన సందేశాన్ని టైప్ చేయండి...'
                        : 'Type a respectful, deen-conscious message...'
                    }
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    className="p-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors shrink-0"
                    title="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-stone-400 text-xs">
                <div>
                  <Users className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                  <p>{isTelugu ? 'ఎడమ వైపున ఉన్న సంభాషణను ఎంచుకోండి.' : 'Select a conversation from the left to start chatting.'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {blockReportToast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs px-4 py-2 rounded-lg shadow-lg">
            {blockReportToast}
          </div>
        )}
      </div>
    </div>
  );
};
