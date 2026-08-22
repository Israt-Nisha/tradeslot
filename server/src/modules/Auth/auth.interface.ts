export type TTraderRegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type TTraderLoginInput = {
  email: string;
  password: string;
};

export type TLoginResponse = {
  token: string;
  trader: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    stripeAccountId: string | null;
    stripeOnboarded: boolean;
  };
};