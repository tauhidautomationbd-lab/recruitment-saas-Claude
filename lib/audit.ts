// প্রতিটা গুরুত্বপূর্ণ action (shortlist, reject, interview schedule, AI screening ইত্যাদি)
// এই helper দিয়ে audit_logs টেবিলে record হবে — কে, কখন, কী করেছে তার ইতিহাস।

export async function logAudit(
  supabase: any,
  params: {
    companyId: string;
    actorUserId: string | null;
    action: string;
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    await supabase.from("audit_logs").insert({
      company_id: params.companyId,
      actor_user_id: params.actorUserId,
      action: params.action,
      target_type: params.targetType || null,
      target_id: params.targetId || null,
      metadata: params.metadata || null,
    });
  } catch (e) {
    // audit log ব্যর্থ হলেও মূল কাজ থামানো উচিত না
    console.log("Audit log লিখতে ব্যর্থ:", e);
  }
}
