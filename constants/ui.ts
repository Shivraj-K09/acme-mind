export const SHAKE_MS = 280;
export const HOLD_MS = 3000;

export const LOGIN_ERRORS: Record<
  string,
  { title: string; description: string }
> = {
  invalid_link: {
    title: "This link is invalid or has expired",
    description:
      "Invite and password links only work once. Please ask for a new link or create the client again.",
  },
};
