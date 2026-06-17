// fe\src\modules\auth\login\components\LoginLoader.jsx
import { Spin, Typography } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function LoginLoader() {
 return (
  <div className="login-page">
   <div className="glass-card login-loader-card">
    <SafetyCertificateOutlined className="login-loader-icon" />
    <Spin size="large" />
    <Text className="login-loader-text">
     Menyiapkan sesi aman...
    </Text>
   </div>
  </div>
 );
}