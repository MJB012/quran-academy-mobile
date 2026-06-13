import { api, unwrap } from '../client';
import { StoredUser, TokenStore } from '../token-store';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const UsersService = {
  async me(): Promise<StoredUser> {
    const user = await unwrap<StoredUser>(api.get('/users/me'));
    await TokenStore.setUser(user);
    return user;
  },

  async updateMe(input: UpdateProfileInput): Promise<StoredUser> {
    const user = await unwrap<StoredUser>(api.patch('/users/me', input));
    await TokenStore.setUser(user);
    return user;
  },
};
