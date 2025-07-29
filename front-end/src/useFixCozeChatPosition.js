import { useEffect } from "react";

function useFixCozeChatPosition() {
  useEffect(() => {
    function fixPosition() {
      const nodes = Array.from(document.querySelectorAll('div[style*="position: fixed"]'));
      nodes.forEach(node => {
        const style = node.style;
        if (
          style &&
          style.width === "56px" &&
          style.height === "56px" &&
          style.right === "30px"
        ) {
          style.bottom = "160px";
          style.right = "30px";
          style.left = "auto";
          style.top = "auto";
          style.zIndex = "1000";
        }
      });
    }

    // Chạy fix ngay khi mount
    fixPosition();

    // Theo dõi mọi thay đổi DOM để fix lại vị trí nếu widget render lại
    const observer = new MutationObserver(fixPosition);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    // Cleanup
    return () => observer.disconnect();
  }, []);
}

export default useFixCozeChatPosition; 