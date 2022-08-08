function domReady(
	condition: DocumentReadyState[] = ["complete", "interactive"]
) {
	return new Promise((resolve) => {
		if (condition.includes(document.readyState)) {
			resolve(true);
		} else {
			document.addEventListener("readystatechange", () => {
				if (condition.includes(document.readyState)) {
					resolve(true);
				}
			});
		}
	});
}

const safeDOM = {
	append(parent: HTMLElement, child: HTMLElement) {
		if (!Array.from(parent.children).find((e) => e === child)) {
			return parent.appendChild(child);
		}
	},
	remove(parent: HTMLElement, child: HTMLElement) {
		if (Array.from(parent.children).find((e) => e === child)) {
			return parent.removeChild(child);
		}
	},
};

/**
 * https://loading.io/css/
 */
function useLoading() {
	const className = "loaders-css__square-spin";
	const styleContent = `
@keyframes spin {
    0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.${className} > div {
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid #fff;
  border-color: #fff transparent #fff transparent;
  animation: spin 1.2s linear infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #25262b;
  z-index: 9;
}
    `;
	const oStyle = document.createElement("style");
	const oDiv = document.createElement("div");

	oStyle.id = "app-loading-style";
	oStyle.innerHTML = styleContent;
	oDiv.className = "app-loading-wrap";
	oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

	return {
		appendLoading() {
			safeDOM.append(document.head, oStyle);
			safeDOM.append(document.body, oDiv);
		},
		removeLoading() {
			safeDOM.remove(document.head, oStyle);
			safeDOM.remove(document.body, oDiv);
		},
	};
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev: MessageEvent) => {
	ev.data.payload === "removeLoading" && removeLoading();
};

setTimeout(removeLoading, 4999);
