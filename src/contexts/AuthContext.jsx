import { createContext, useContext, useState } from "react";

// グローバルで管理する Context を作成
const AuthContext = createContext();

// Context を提供する Provider コンポーネント
export const AuthProvider = ({ children }) => {
  // ownerId（ログインしたオーナーのID）を保持
  const [ownerId, setOwnerId] = useState(null);

  return (
    <AuthContext.Provider value={{ ownerId, setOwnerId }}>
      {children}
    </AuthContext.Provider>
  );
};

// Context を使うためのカスタムフック（安全に取り出せるようにする）
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
