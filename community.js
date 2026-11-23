(() => {
  const board = document.querySelector("#community-board");
  const detail = document.querySelector("#community-detail");
  const dialog = document.querySelector("#contribute-dialog");
  const form = document.querySelector("#contribute-form");
  const open = document.querySelector("#contribute-open");
  const login = document.querySelector("#community-login");
  const status = document.querySelector("#community-status");
  const preview = document.querySelector("#contribute-preview");
  const more = document.querySelector("#community-more");
  const roleNames = { jinyue: "金跃", qizai: "七仔", danxiang: "丹翔", yantuo: "岩拓", team: "四宝合辑" };
  const clock = new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeZone: "Asia/Shanghai" });
  const path = "/api/community";
  let version = 0;
  let page = 0;
  let previewUrl;

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  async function request(route, options) {
    const response = await fetch(path + route, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !response.headers.get("Content-Type")?.includes("application/json")) {
      throw new Error(data.error || "共创区暂时无法访问，请稍后重试。");
    }
    return data;
  }

  function loginLink() {
    const link = element("a", "登录后参与", "button ghost");
    link.href = "/community-login?return_to=" + encodeURIComponent("/" + location.hash);
    link.target = "_top";
    return link;
  }

  function imageFor(post) {
    const image = element("img");
    image.src = path + "/posts/" + post.id + "/image";
    image.alt = post.title;
    image.loading = "lazy";
    return image;
  }

  function button(label, fn, className = "text-link") {
    const control = element("button", label, className);
    control.type = "button";
    control.addEventListener("click", fn);
    return control;
  }

  function card(post) {
    const a = element("a", "", "community-card");
    a.href = "#community/" + post.id;
    const copy = element("div");
    copy.append(element("p", roleNames[post.role], "eyebrow"), element("h3", post.title), element("p", post.nickname + " · " + clock.format(post.created_at)));
    a.append(imageFor(post), copy);
    return a;
  }

  async function fillBoard(token, append = false) {
    more.hidden = true;
    try {
      const data = await request("/posts?page=" + page);
      if (version !== token) return;
      open.hidden = !data.canPost;
      if (data.canPost) {
        const logout = element("form");
        logout.method = "post";
        logout.action = "/community-logout";
        const submit = element("button", "退出投稿账号", "button ghost");
        submit.type = "submit";
        logout.append(submit);
        login.replaceChildren(logout);
      } else {
        login.replaceChildren(loginLink());
      }
      if (!append) board.replaceChildren();
      if (!append && !data.posts.length) {
        const empty = element("div", "", "community-empty");
        empty.append(element("h2", "等你的第一张图"), element("p", "可以是一张四宝手绘、一件文创打样，或一幅你想继续完善的草图。"));
        board.append(empty);
      }
      board.append(...data.posts.map(card));
      status.textContent = "";
      more.hidden = !data.hasMore;
    } catch (error) {
      if (version !== token) return;
      status.textContent = error.message;
      more.hidden = false;
      more.textContent = "重试加载";
      more.dataset.retry = "true";
    }
  }

  function removal(label, route, onDone, feedback) {
    return button(label, async (event) => {
      const control = event.currentTarget;
      if (control.dataset.confirm !== "yes") {
        control.dataset.confirm = "yes";
        control.textContent = "确认" + label;
        return;
      }
      control.disabled = true;
      try {
        await request(route, { method: "DELETE" });
        onDone();
      } catch (error) {
        feedback.textContent = error.message;
        control.disabled = false;
      }
    });
  }

  async function fillDetail(id, token) {
    const data = await request("/posts/" + id);
    if (token !== version) return;
    const { post, comments, canPost, canDelete } = data;
    const copy = element("div", "", "community-thread-copy");
    const meta = element("p", roleNames[post.role] + " · " + post.nickname + " · " + clock.format(post.created_at), "eyebrow");
    const desc = element("p", post.body, "community-body");
    const actions = element("div", "", "buttons");
    const share = button("复制作品链接", async (event) => {
      const control = event.currentTarget;
      try {
        await navigator.clipboard.writeText(location.href);
        control.textContent = "链接已复制";
      } catch {
        const field = element("input");
        field.value = location.href;
        field.readOnly = true;
        field.setAttribute("aria-label", "作品链接");
        actions.append(field);
        field.select();
      }
    }, "button ghost");
    actions.append(share);
    if (canDelete) actions.append(removal("删除投稿", "/posts/" + id, () => { location.hash = "community"; }, status));
    copy.append(meta, element("h2", post.title), desc, actions);

    const thread = element("section", "", "community-comments");
    thread.append(element("h2", "作品讨论"));
    if (!comments.length) thread.append(element("p", "还没有留言。可以说说你喜欢的细节，或给作者留个建议。"));
    for (const comment of comments) {
      const card = element("article");
      card.append(element("p", comment.nickname + " · " + clock.format(comment.created_at), "eyebrow"), element("p", comment.body, "community-body"));
      if (comment.canDelete) card.append(removal("删除留言", "/comments/" + comment.id, () => card.remove(), status));
      thread.append(card);
    }
    if (canPost) {
      const reply = document.querySelector("#comment-template").content.firstElementChild.cloneNode(true);
      reply.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submit = reply.querySelector("button");
        const feedback = reply.querySelector("[role=status]");
        submit.disabled = true;
        try {
          await request("/posts/" + id + "/comments", { method: "POST", body: new FormData(reply) });
          if (token === version) await fillDetail(id, token);
        } catch (error) {
          feedback.textContent = error.message;
        } finally {
          submit.disabled = false;
        }
      });
      thread.append(reply);
    } else {
      thread.append(loginLink());
    }
    const article = element("article", "", "community-thread");
    article.append(imageFor(post), copy);
    detail.replaceChildren(article, thread);
    status.textContent = "";
  }

  window.renderCommunity = (id) => {
    const token = ++version;
    document.querySelector("#community-return").replaceChildren();
    if (!window.QinlingConfig?.communityEnabled) {
      detail.hidden = true;
      document.querySelector("#community-feed").hidden = true;
      status.textContent = "此站为静态展示版。可以浏览四宝故事、动态影像、表情和作品展厅。";
      return;
    }
    detail.hidden = !id;
    document.querySelector("#community-feed").hidden = Boolean(id);
    status.textContent = "正在加载…";
    if (!id) {
      page = 0;
      board.replaceChildren();
      more.textContent = "加载更多";
      delete more.dataset.retry;
      fillBoard(token);
      return;
    }
    const back = element("a", "返回共创广场", "text-link");
    back.href = "#community";
    detail.replaceChildren();
    document.querySelector("#community-return").replaceChildren(back);
    fillDetail(id, token).catch(error => {
      if (token === version) status.textContent = error.message;
    });
  };

  more.addEventListener("click", () => {
    if (!more.dataset.retry) page++;
    const append = page > 0;
    more.textContent = "加载更多";
    delete more.dataset.retry;
    fillBoard(version, append);
  });

  open.addEventListener("click", () => dialog.showModal());
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  form.elements.image.addEventListener("change", () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const file = form.elements.image.files[0];
    previewUrl = file ? URL.createObjectURL(file) : undefined;
    preview.hidden = !file;
    if (file) preview.src = previewUrl;
  });

  async function resizeImage(file) {
    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("请选择 JPG、PNG 或 WebP 图片。");
    if (file.size > 20 * 1024 * 1024) throw new Error("请选择 20 MB 以内的原图。");
    const bitmap = await createImageBitmap(file).catch(() => { throw new Error("图片无法读取，请另选一张。"); });
    try {
      const scale = Math.min(1, 1440 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.86, 0.67, 0.46]) {
        const image = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", quality));
        if (image?.size && image.size <= 2 * 1024 * 1024) return image;
      }
      throw new Error("压缩后仍超过 2 MB，请裁剪图片后重试。");
    } finally {
      bitmap.close();
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector("button[type=submit]");
    const feedback = form.querySelector("[role=status]");
    submit.disabled = true;
    feedback.textContent = "正在上传图片…";
    try {
      const data = new FormData(form);
      data.set("image", await resizeImage(data.get("image")), "artwork.webp");
      const result = await request("/posts", { method: "POST", body: data });
      form.reset();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = undefined;
      preview.hidden = true;
      preview.removeAttribute("src");
      feedback.textContent = "";
      dialog.close();
      location.hash = "community/" + result.id;
    } catch (error) {
      feedback.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });
})();
