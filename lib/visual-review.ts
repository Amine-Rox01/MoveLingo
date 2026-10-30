// Visual review concerns the illustrated sequence, not classroom efficacy or PE approval.
export const reviewedVisuals:Record<string,{note:string}>={
 simon:{note:'Shows a leader, a response and a change of leader. The spoken “Simon says” rule must be explained; it cannot be seen in the pictures.'},
 robot:{note:'Shows a private destination, spoken guidance, a learner following directions on a floor grid and the destination card being revealed. The grid and marker shift between generated frames; teacher modelling remains essential.'},
};
export function visualReview(id:string){return reviewedVisuals[id]}
