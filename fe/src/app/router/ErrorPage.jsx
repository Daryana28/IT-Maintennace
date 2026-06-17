// fe\src\app\router\ErrorPage.jsx
import { Result, Button } from "antd";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
 const error = useRouteError();

 return (
  <div
   style={{
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
   }}
  >
   <Result
    status="error"
    title="Application Error"
    subTitle={
     error?.message ||
     "Unexpected error"
    }
    extra={
     <Button
      type="primary"
      onClick={() =>
       window.location.reload()
      }
     >
      Reload
     </Button>
    }
   />
  </div>
 );
}