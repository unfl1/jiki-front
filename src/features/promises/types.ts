export type PromiseSummary = { title: string; date: string; time: string; promiseId: number; creatorUsername: string };

export type PromiseCreatePayload = {
  title: string;
  date: string;
  time: string;
  penalty: number;
  latitude: number;
  longitude: number;
};

export type PromiseDetail = PromiseCreatePayload & {
  promiseId: number;
  participantUsernames: string[];
  participantIds?: number[];
};
