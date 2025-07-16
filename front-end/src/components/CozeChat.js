import { useEffect } from "react";

const CozeChat = () => {
  useEffect(() => {
    // Tạo script tag cho SDK
    const script = document.createElement("script");
    script.src = "https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/oversea/index.js";
    script.async = true;
    document.body.appendChild(script);

    // Khi script load xong, khởi tạo chat widget
    script.onload = () => {
      if (window.CozeWebSDK) {
        new window.CozeWebSDK.WebChatClient({
          config: {
            bot_id: "7522376538592559122",
          },
          componentProps: {
            title: "Coze",
            position: { bottom: "180px", right: "24px" }
          },
          auth: {
            type: "token",
            token: "pat_zMfXCYIxA9kUTkbPYR3gLnepbkMxUJ3XdkMCBXbjKIKQVsdif16RHrgfhLmx5t6m", // Thay bằng token thật
            onRefreshToken: function () {
              return "pat_zMfXCYIxA9kUTkbPYR3gLnepbkMxUJ3XdkMCBXbjKIKQVsdif16RHrgfhLmx5t6m";
            },
          },
        });
      }
    };

    // Cleanup khi component unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // Không render gì cả, chỉ nhúng script
};

export default CozeChat; 