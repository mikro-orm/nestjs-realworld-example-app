export interface IProfileData {
  username: string;
  bio: string;
  image?: string;
  following?: boolean;
}

export interface IProfileRO {
  profile: IProfileData;
}
