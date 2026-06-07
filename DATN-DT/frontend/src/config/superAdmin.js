export const SUPER_ADMIN_EMAIL = 'duc30072004@gmail.com';

export const isSuperAdmin = (user) => {
    if (!user?.email) return false;
    return user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL;
};
