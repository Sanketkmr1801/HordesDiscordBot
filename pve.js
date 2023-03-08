function noop() {}
function assign(t, e) {
    for (const n in e)
        t[n] = e[n];
    return t
}
function run(t) {
    return t()
}
function blank_object() {
    return Object.create(null)
}
function run_all(t) {
    t.forEach(run)
}
function is_function(t) {
    return "function" == typeof t
}
function safe_not_equal(t, e) {
    return t != t ? e == e : t !== e || t && "object" == typeof t || "function" == typeof t
}
function not_equal(t, e) {
    return t != t ? e == e : t !== e
}
function is_empty(t) {
    return 0 === Object.keys(t).length
}
function subscribe(t, ...e) {
    if (null == t)
        return noop;
    const n = t.subscribe(...e);
    return n.unsubscribe ? ()=>n.unsubscribe() : n
}
function component_subscribe(t, e, n) {
    t.$$.on_destroy.push(subscribe(e, n))
}
function create_slot(t, e, n, a) {
    if (t) {
        const s = get_slot_context(t, e, n, a);
        return t[0](s)
    }
}
function get_slot_context(t, e, n, a) {
    return t[1] && a ? assign(n.ctx.slice(), t[1](a(e))) : n.ctx
}
function get_slot_changes(t, e, n, a) {
    if (t[2] && a) {
        const s = t[2](a(n));
        if (void 0 === e.dirty)
            return s;
        if ("object" == typeof s) {
            const t = []
              , n = Math.max(e.dirty.length, s.length);
            for (let a = 0; a < n; a += 1)
                t[a] = e.dirty[a] | s[a];
            return t
        }
        return e.dirty | s
    }
    return e.dirty
}
function update_slot(t, e, n, a, s, r, i) {
    const o = get_slot_changes(e, a, s, r);
    if (o) {
        const s = get_slot_context(e, n, a, i);
        t.p(s, o)
    }
}
function null_to_empty(t) {
    return null == t ? "" : t
}
function set_store_value(t, e, n=e) {
    return t.set(n),
    e
}
function append(t, e) {
    t.appendChild(e)
}
function insert(t, e, n) {
    t.insertBefore(e, n || null)
}
function detach(t) {
    t.parentNode.removeChild(t)
}
function destroy_each(t, e) {
    for (let n = 0; n < t.length; n += 1)
        t[n] && t[n].d(e)
}
function element(t) {
    return document.createElement(t)
}
function text(t) {
    return document.createTextNode(t)
}
function space() {
    return text(" ")
}
function empty() {
    return text("")
}
function listen(t, e, n, a) {
    return t.addEventListener(e, n, a),
    ()=>t.removeEventListener(e, n, a)
}
function attr(t, e, n) {
    null == n ? t.removeAttribute(e) : t.getAttribute(e) !== n && t.setAttribute(e, n)
}
function to_number(t) {
    return "" === t ? void 0 : +t
}
function children(t) {
    return Array.from(t.childNodes)
}
function set_data(t, e) {
    e = "" + e,
    t.wholeText !== e && (t.data = e)
}
function set_input_value(t, e) {
    t.value = null == e ? "" : e
}
function set_style(t, e, n, a) {
    t.style.setProperty(e, n, a ? "important" : "")
}
function select_option(t, e) {
    for (let n = 0; n < t.options.length; n += 1) {
        const a = t.options[n];
        if (a.__value === e)
            return void (a.selected = !0)
    }
}
function select_value(t) {
    const e = t.querySelector(":checked") || t.options[0];
    return e && e.__value
}
function custom_event(t, e) {
    const n = document.createEvent("CustomEvent");
    return n.initCustomEvent(t, !1, !1, e),
    n
}
let current_component;
function set_current_component(t) {
    current_component = t
}
function get_current_component() {
    if (!current_component)
        throw new Error("Function called outside component initialization");
    return current_component
}
function createEventDispatcher() {
    const t = get_current_component();
    return (e,n)=>{
        const a = t.$$.callbacks[e];
        if (a) {
            const s = custom_event(e, n);
            a.slice().forEach(e=>{
                e.call(t, s)
            }
            )
        }
    }
}
const dirty_components = []
  , binding_callbacks = []
  , render_callbacks = []
  , flush_callbacks = []
  , resolved_promise = Promise.resolve();
let update_scheduled = !1;
function schedule_update() {
    update_scheduled || (update_scheduled = !0,
    resolved_promise.then(flush))
}
function add_render_callback(t) {
    render_callbacks.push(t)
}
let flushing = !1;
const seen_callbacks = new Set;
function flush() {
    if (!flushing) {
        flushing = !0;
        do {
            for (let t = 0; t < dirty_components.length; t += 1) {
                const e = dirty_components[t];
                set_current_component(e),
                update(e.$$)
            }
            for (dirty_components.length = 0; binding_callbacks.length; )
                binding_callbacks.pop()();
            for (let t = 0; t < render_callbacks.length; t += 1) {
                const e = render_callbacks[t];
                seen_callbacks.has(e) || (seen_callbacks.add(e),
                e())
            }
            render_callbacks.length = 0
        } while (dirty_components.length);
        for (; flush_callbacks.length; )
            flush_callbacks.pop()();
        update_scheduled = !1,
        flushing = !1,
        seen_callbacks.clear()
    }
}
function update(t) {
    if (null !== t.fragment) {
        t.update(),
        run_all(t.before_update);
        const e = t.dirty;
        t.dirty = [-1],
        t.fragment && t.fragment.p(t.ctx, e),
        t.after_update.forEach(add_render_callback)
    }
}
const outroing = new Set;
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros
    }
}
function check_outros() {
    outros.r || run_all(outros.c),
    outros = outros.p
}
function transition_in(t, e) {
    t && t.i && (outroing.delete(t),
    t.i(e))
}
function transition_out(t, e, n, a) {
    if (t && t.o) {
        if (outroing.has(t))
            return;
        outroing.add(t),
        outros.c.push(()=>{
            outroing.delete(t),
            a && (n && t.d(1),
            a())
        }
        ),
        t.o(e)
    }
}
function create_component(t) {
    t && t.c()
}
function mount_component(t, e, n) {
    const {fragment: a, on_mount: s, on_destroy: r, after_update: i} = t.$$;
    a && a.m(e, n),
    add_render_callback(()=>{
        const e = s.map(run).filter(is_function);
        r ? r.push(...e) : run_all(e),
        t.$$.on_mount = []
    }
    ),
    i.forEach(add_render_callback)
}
function destroy_component(t, e) {
    const n = t.$$;
    null !== n.fragment && (run_all(n.on_destroy),
    n.fragment && n.fragment.d(e),
    n.on_destroy = n.fragment = null,
    n.ctx = [])
}
function make_dirty(t, e) {
    -1 === t.$$.dirty[0] && (dirty_components.push(t),
    schedule_update(),
    t.$$.dirty.fill(0)),
    t.$$.dirty[e / 31 | 0] |= 1 << e % 31
}
function init(t, e, n, a, s, r, i=[-1]) {
    const o = current_component;
    set_current_component(t);
    const l = e.props || {}
      , c = t.$$ = {
        fragment: null,
        ctx: null,
        props: r,
        update: noop,
        not_equal: s,
        bound: blank_object(),
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(o ? o.$$.context : []),
        callbacks: blank_object(),
        dirty: i,
        skip_bound: !1
    };
    let d = !1;
    if (c.ctx = n ? n(t, l, (e,n,...a)=>{
        const r = a.length ? a[0] : n;
        return c.ctx && s(c.ctx[e], c.ctx[e] = r) && (!c.skip_bound && c.bound[e] && c.bound[e](r),
        d && make_dirty(t, e)),
        n
    }
    ) : [],
    c.update(),
    d = !0,
    run_all(c.before_update),
    c.fragment = !!a && a(c.ctx),
    e.target) {
        if (e.hydrate) {
            const t = children(e.target);
            c.fragment && c.fragment.l(t),
            t.forEach(detach)
        } else
            c.fragment && c.fragment.c();
        e.intro && transition_in(t.$$.fragment),
        mount_component(t, e.target, e.anchor),
        flush()
    }
    set_current_component(o)
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1),
        this.$destroy = noop
    }
    $on(t, e) {
        const n = this.$$.callbacks[t] || (this.$$.callbacks[t] = []);
        return n.push(e),
        ()=>{
            const t = n.indexOf(e);
            -1 !== t && n.splice(t, 1)
        }
    }
    $set(t) {
        this.$$set && !is_empty(t) && (this.$$.skip_bound = !0,
        this.$$set(t),
        this.$$.skip_bound = !1)
    }
}
function get_each_context$4(t, e, n) {
    const a = t.slice();
    return a[5] = e[n],
    a
}
function get_each_context_1$4(t, e, n) {
    const a = t.slice();
    return a[5] = e[n],
    a
}
function get_each_context_2$3(t, e, n) {
    const a = t.slice();
    return a[5] = e[n],
    a
}
function get_each_context_3$3(t, e, n) {
    const a = t.slice();
    return a[5] = e[n],
    a
}
function create_each_block_3$3(t) {
    let e, n, a, s = t[5][1] + "";
    return {
        c() {
            e = element("a"),
            n = text(s),
            attr(e, "href", a = t[5][0]),
            attr(e, "target", "_blank"),
            attr(e, "rel", "noopener"),
            attr(e, "class", "svelte-1s5c3dd")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function create_each_block_2$3(t) {
    let e, n, a, s = t[5][1] + "";
    return {
        c() {
            e = element("a"),
            n = text(s),
            attr(e, "href", a = t[5][0]),
            attr(e, "class", "svelte-1s5c3dd")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function create_each_block_1$4(t) {
    let e, n, a, s = t[5][1] + "";
    return {
        c() {
            e = element("a"),
            n = text(s),
            attr(e, "href", a = t[5][0]),
            attr(e, "target", "_blank"),
            attr(e, "rel", "noopener"),
            attr(e, "class", "svelte-1s5c3dd")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function create_each_block$4(t) {
    let e, n, a, s = t[5][1] + "";
    return {
        c() {
            e = element("a"),
            n = text(s),
            attr(e, "href", a = t[5][0]),
            attr(e, "class", "svelte-1s5c3dd")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function create_fragment$a(t) {
    let e, n, a, s, r, i, o, l, c, d, p, u, m = t[3], f = [];
    for (let e = 0; e < m.length; e += 1)
        f[e] = create_each_block_3$3(get_each_context_3$3(t, m, e));
    let g = t[2]
      , h = [];
    for (let e = 0; e < g.length; e += 1)
        h[e] = create_each_block_2$3(get_each_context_2$3(t, g, e));
    let _ = t[1]
      , b = [];
    for (let e = 0; e < _.length; e += 1)
        b[e] = create_each_block_1$4(get_each_context_1$4(t, _, e));
    let k = t[4]
      , y = [];
    for (let e = 0; e < k.length; e += 1)
        y[e] = create_each_block$4(get_each_context$4(t, k, e));
    return {
        c() {
            e = element("footer"),
            n = element("div"),
            a = element("div"),
            s = element("h4"),
            s.textContent = "Contribute";
            for (let t = 0; t < f.length; t += 1)
                f[t].c();
            r = element("div"),
            i = element("h4"),
            i.textContent = "Game";
            for (let t = 0; t < h.length; t += 1)
                h[t].c();
            o = element("div"),
            l = element("h4"),
            l.textContent = "Social";
            for (let t = 0; t < b.length; t += 1)
                b[t].c();
            c = element("div"),
            d = element("h4"),
            d.textContent = "Information";
            for (let t = 0; t < y.length; t += 1)
                y[t].c();
            u = element("h5"),
            u.textContent = "© 2022 Hordes.io",
            attr(s, "class", "svelte-1s5c3dd"),
            attr(a, "class", "linkcol svelte-1s5c3dd"),
            attr(i, "class", "svelte-1s5c3dd"),
            attr(r, "class", "linkcol svelte-1s5c3dd"),
            attr(l, "class", "svelte-1s5c3dd"),
            attr(o, "class", "linkcol svelte-1s5c3dd"),
            attr(d, "class", "svelte-1s5c3dd"),
            attr(c, "class", "linkcol svelte-1s5c3dd"),
            attr(n, "class", p = "row " + (t[0] ? "slim" : "") + " footerlinks svelte-1s5c3dd"),
            attr(u, "class", "textcenter"),
            set_style(u, "margin-top", "100px"),
            set_style(u, "color", "#687f84"),
            attr(e, "class", "svelte-1s5c3dd")
        },
        m(t, p) {
            insert(t, e, p),
            append(e, n),
            append(n, a),
            append(a, s);
            for (let t = 0; t < f.length; t += 1)
                f[t].m(a, null);
            append(n, r),
            append(r, i);
            for (let t = 0; t < h.length; t += 1)
                h[t].m(r, null);
            append(n, o),
            append(o, l);
            for (let t = 0; t < b.length; t += 1)
                b[t].m(o, null);
            append(n, c),
            append(c, d);
            for (let t = 0; t < y.length; t += 1)
                y[t].m(c, null);
            append(e, u)
        },
        p(t, [e]) {
            if (8 & e) {
                let n;
                for (m = t[3],
                n = 0; n < m.length; n += 1) {
                    const s = get_each_context_3$3(t, m, n);
                    f[n] ? f[n].p(s, e) : (f[n] = create_each_block_3$3(s),
                    f[n].c(),
                    f[n].m(a, null))
                }
                for (; n < f.length; n += 1)
                    f[n].d(1);
                f.length = m.length
            }
            if (4 & e) {
                let n;
                for (g = t[2],
                n = 0; n < g.length; n += 1) {
                    const a = get_each_context_2$3(t, g, n);
                    h[n] ? h[n].p(a, e) : (h[n] = create_each_block_2$3(a),
                    h[n].c(),
                    h[n].m(r, null))
                }
                for (; n < h.length; n += 1)
                    h[n].d(1);
                h.length = g.length
            }
            if (2 & e) {
                let n;
                for (_ = t[1],
                n = 0; n < _.length; n += 1) {
                    const a = get_each_context_1$4(t, _, n);
                    b[n] ? b[n].p(a, e) : (b[n] = create_each_block_1$4(a),
                    b[n].c(),
                    b[n].m(o, null))
                }
                for (; n < b.length; n += 1)
                    b[n].d(1);
                b.length = _.length
            }
            if (16 & e) {
                let n;
                for (k = t[4],
                n = 0; n < k.length; n += 1) {
                    const a = get_each_context$4(t, k, n);
                    y[n] ? y[n].p(a, e) : (y[n] = create_each_block$4(a),
                    y[n].c(),
                    y[n].m(c, null))
                }
                for (; n < y.length; n += 1)
                    y[n].d(1);
                y.length = k.length
            }
            1 & e && p !== (p = "row " + (t[0] ? "slim" : "") + " footerlinks svelte-1s5c3dd") && attr(n, "class", p)
        },
        i: noop,
        o: noop,
        d(t) {
            t && detach(e),
            destroy_each(f, t),
            destroy_each(h, t),
            destroy_each(b, t),
            destroy_each(y, t)
        }
    }
}
function instance$a(t, e, n) {
    let {slim: a=!1} = e;
    const s = [["https://discord.gg/hordes", "Discord"], ["https://twitter.com/hordesio", "Twitter"], ["https://www.instagram.com/hordesio.official", "Instagram"], ["https://reddit.com/r/hordesio", "Reddit"], ["https://www.youtube.com/channel/UCEKpcTk3NgmjFDo2at6R1ew", "YouTube"], ["https://www.facebook.com/hordesio", "Facebook"]]
      , r = [["/players", "Players"], ["/clans", "Clans"], ["/info/items", "Items"], ["/info/skills", "Skills"], ["/worldeditor", "World Editor"], ["/technical", "Technical Help"]]
      , i = [["/partners", "Partners"], ["https://github.com/dekdevy/hordes-loc", "Localization"], ["https://hordesio.miraheze.org/", "Wiki"]]
      , o = [["/presskit", "Presskit"], ["mailto:hello@hordes.io", "Support"], ["/terms#terms-and-conditions", "Terms of Service"], ["/terms#privacy-policy", "Privacy Policy"]];
    return t.$$set = t=>{
        "slim"in t && n(0, a = t.slim)
    }
    ,
    [a, s, r, i, o]
}
class Footer extends SvelteComponent {
    constructor(t) {
        super(),
        init(this, t, instance$a, create_fragment$a, safe_not_equal, {
            slim: 0
        })
    }
}
function get_each_context$3(t, e, n) {
    const a = t.slice();
    return a[9] = e[n],
    a
}
function get_each_context_1$3(t, e, n) {
    const a = t.slice();
    return a[9] = e[n],
    a
}
function create_each_block_1$3(t) {
    let e, n, a, s, r, i = t[9].name + "";
    return {
        c() {
            e = element("a"),
            n = text(i),
            attr(e, "style", a = t[9].style),
            attr(e, "class", s = "navlink " + (window.location.pathname === t[9].ref ? "bold textwhite" : "") + " svelte-160b3lt"),
            attr(e, "href", r = t[9].ref)
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_2$3(t) {
    let e, n = t[5], a = [];
    for (let e = 0; e < n.length; e += 1)
        a[e] = create_each_block$3(get_each_context$3(t, n, e));
    return {
        c() {
            for (let t = 0; t < a.length; t += 1)
                a[t].c();
            e = empty()
        },
        m(t, n) {
            for (let e = 0; e < a.length; e += 1)
                a[e].m(t, n);
            insert(t, e, n)
        },
        p(t, s) {
            if (32 & s) {
                let r;
                for (n = t[5],
                r = 0; r < n.length; r += 1) {
                    const i = get_each_context$3(t, n, r);
                    a[r] ? a[r].p(i, s) : (a[r] = create_each_block$3(i),
                    a[r].c(),
                    a[r].m(e.parentNode, e))
                }
                for (; r < a.length; r += 1)
                    a[r].d(1);
                a.length = n.length
            }
        },
        d(t) {
            destroy_each(a, t),
            t && detach(e)
        }
    }
}
function create_each_block$3(t) {
    let e, n, a, s, r, i = t[9].name + "";
    return {
        c() {
            e = element("a"),
            n = text(i),
            attr(e, "style", a = t[9].style),
            attr(e, "class", s = "menulink " + (window.location.pathname === t[9].ref ? "bold textwhite" : "") + " svelte-160b3lt"),
            attr(e, "href", r = t[9].ref)
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function create_else_block$3(t) {
    let e, n;
    return {
        c() {
            e = element("div"),
            attr(e, "class", n = null_to_empty(t[2] ? "slot" : "") + " svelte-160b3lt")
        },
        m(t, n) {
            insert(t, e, n)
        },
        p(t, a) {
            4 & a && n !== (n = null_to_empty(t[2] ? "slot" : "") + " svelte-160b3lt") && attr(e, "class", n)
        },
        i: noop,
        o: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block$5(t) {
    let e, n, a, s;
    const r = t[7].default
      , i = create_slot(r, t, t[6], null);
    let o = t[2] && create_if_block_1$4(t);
    return {
        c() {
            e = element("div"),
            i && i.c(),
            o && o.c(),
            a = empty(),
            attr(e, "class", n = "fadeIn " + (t[2] ? "slot" : "") + " svelte-160b3lt")
        },
        m(t, n) {
            insert(t, e, n),
            i && i.m(e, null),
            o && o.m(t, n),
            insert(t, a, n),
            s = !0
        },
        p(t, l) {
            i && i.p && 64 & l && update_slot(i, r, t, t[6], l, null, null),
            (!s || 4 & l && n !== (n = "fadeIn " + (t[2] ? "slot" : "") + " svelte-160b3lt")) && attr(e, "class", n),
            t[2] ? o ? (o.p(t, l),
            4 & l && transition_in(o, 1)) : (o = create_if_block_1$4(t),
            o.c(),
            transition_in(o, 1),
            o.m(a.parentNode, a)) : o && (group_outros(),
            transition_out(o, 1, 1, ()=>{
                o = null
            }
            ),
            check_outros())
        },
        i(t) {
            s || (transition_in(i, t),
            transition_in(o),
            s = !0)
        },
        o(t) {
            transition_out(i, t),
            transition_out(o),
            s = !1
        },
        d(t) {
            t && detach(e),
            i && i.d(t),
            o && o.d(t),
            t && detach(a)
        }
    }
}
function create_if_block_1$4(t) {
    let e, n;
    return e = new Footer({
        props: {
            slim: t[1]
        }
    }),
    {
        c() {
            create_component(e.$$.fragment)
        },
        m(t, a) {
            mount_component(e, t, a),
            n = !0
        },
        p(t, n) {
            const a = {};
            2 & n && (a.slim = t[1]),
            e.$set(a)
        },
        i(t) {
            n || (transition_in(e.$$.fragment, t),
            n = !0)
        },
        o(t) {
            transition_out(e.$$.fragment, t),
            n = !1
        },
        d(t) {
            destroy_component(e, t)
        }
    }
}
function create_fragment$9(t) {
    let e, n, a, s, r, i, o, l, c, d, p, u, m, f, g = t[5], h = [];
    for (let e = 0; e < g.length; e += 1)
        h[e] = create_each_block_1$3(get_each_context_1$3(t, g, e));
    let _ = t[4] && create_if_block_2$3(t);
    const b = [create_if_block$5, create_else_block$3]
      , k = [];
    function y(t, e) {
        return t[3] ? 0 : 1
    }
    return c = y(t),
    d = k[c] = b[c](t),
    {
        c() {
            e = element("div"),
            n = element("div"),
            a = element("a"),
            a.innerHTML = '<img alt="Hordes.io" class="icon svelte-160b3lt" src="/assets/ui/icon.svg?v=5700123">',
            s = element("nav");
            for (let t = 0; t < h.length; t += 1)
                h[t].c();
            r = element("img"),
            _ && _.c(),
            d.c(),
            p = empty(),
            attr(a, "href", "/"),
            attr(s, "class", "nav svelte-160b3lt"),
            attr(r, "class", "icon menubtn svelte-160b3lt"),
            r.src !== (i = "/assets/ui/icons/menu.svg?v=5700123") && attr(r, "src", i),
            attr(n, "class", "navcontainer svelte-160b3lt"),
            attr(e, "class", o = "row " + (t[1] ? "slim" : "") + " svelte-160b3lt"),
            attr(e, "style", l = t[0] ? "text-align: center;" : "")
        },
        m(i, o) {
            insert(i, e, o),
            append(e, n),
            append(n, a),
            append(n, s);
            for (let t = 0; t < h.length; t += 1)
                h[t].m(s, null);
            append(n, r),
            _ && _.m(e, null),
            k[c].m(i, o),
            insert(i, p, o),
            u = !0,
            m || (f = listen(r, "click", t[8]),
            m = !0)
        },
        p(t, [n]) {
            if (32 & n) {
                let e;
                for (g = t[5],
                e = 0; e < g.length; e += 1) {
                    const a = get_each_context_1$3(t, g, e);
                    h[e] ? h[e].p(a, n) : (h[e] = create_each_block_1$3(a),
                    h[e].c(),
                    h[e].m(s, null))
                }
                for (; e < h.length; e += 1)
                    h[e].d(1);
                h.length = g.length
            }
            t[4] ? _ ? _.p(t, n) : (_ = create_if_block_2$3(t),
            _.c(),
            _.m(e, null)) : _ && (_.d(1),
            _ = null),
            (!u || 2 & n && o !== (o = "row " + (t[1] ? "slim" : "") + " svelte-160b3lt")) && attr(e, "class", o),
            (!u || 1 & n && l !== (l = t[0] ? "text-align: center;" : "")) && attr(e, "style", l);
            let a = c;
            c = y(t),
            c === a ? k[c].p(t, n) : (group_outros(),
            transition_out(k[a], 1, 1, ()=>{
                k[a] = null
            }
            ),
            check_outros(),
            d = k[c],
            d || (d = k[c] = b[c](t),
            d.c()),
            transition_in(d, 1),
            d.m(p.parentNode, p))
        },
        i(t) {
            u || (transition_in(d),
            u = !0)
        },
        o(t) {
            transition_out(d),
            u = !1
        },
        d(t) {
            t && detach(e),
            destroy_each(h, t),
            _ && _.d(),
            k[c].d(t),
            t && detach(p),
            m = !1,
            f()
        }
    }
}
function instance$9(t, e, n) {
    let {center: a=!1} = e
      , {slim: s=!1} = e;
    const r = [{
        name: "Players",
        ref: "/players"
    }, {
        name: "Clans",
        ref: "/clans"
    }, {
        name: "PVP",
        ref: "/pvp"
    }, {
        name: "PVE",
        ref: "/pve"
    }, {
        name: "Items",
        ref: "/info/items"
    }, {
        name: "Skills",
        ref: "/info/skills"
    }, {
        name: "Store",
        ref: "/store",
        style: "margin-left:auto;"
    }, {
        name: "Account",
        ref: "/account"
    }];
    let i = !1
      , {footer: o=!0} = e
      , {show: l=!0} = e
      , {$$slots: c={}, $$scope: d} = e;
    const p = t=>n(4, i = !i);
    return t.$$set = t=>{
        "center"in t && n(0, a = t.center),
        "slim"in t && n(1, s = t.slim),
        "footer"in t && n(2, o = t.footer),
        "show"in t && n(3, l = t.show),
        "$$scope"in t && n(6, d = t.$$scope)
    }
    ,
    [a, s, o, l, i, r, d, c, p]
}
class Layout extends SvelteComponent {
    constructor(t) {
        super(),
        init(this, t, instance$9, create_fragment$9, safe_not_equal, {
            center: 0,
            slim: 1,
            footer: 2,
            show: 3
        })
    }
}
const api = async(t,e,n)=>{
    const a = await fetch(t, {
        method: void 0 !== e ? "POST" : "GET",
        body: e ? JSON.stringify(e) : void 0
    });
    return 500 === a.status ? n(await a.text()) : await a.json()
}
  , imgAlpha = "webp"
  , imgFlat = "webp"
  , bookArtIndex = [0, 0, 1, 1, 2, 3]
  , bookArt = (t,e)=>"book" + (void 0 !== e ? e : "") + bookArtIndex[t % 5]
  , item = (t,e,n,a)=>`/assets/items/${t}/${"book" == t ? bookArt(e, n) : t + e}_q${a}.${imgFlat}?v=5700123`
  , skill = t=>`/assets/ui/skills/${t}.${imgFlat}?v=5700123`
  , pclass = t=>`/assets/ui/classes/${t}.${imgAlpha}?v=5700123`
  , medal = "/assets/ui/currency/medal.svg?v=5700123"
  , intmap = (t,e=!0)=>{
    const n = Object.entries(t);
    return n.forEach(t=>{
        t[0] = parseInt(t[0]),
        e && "object" == typeof t[1] && (t[1] = intmap(t[1]))
    }
    ),
    new Map(n)
}
  , longnum = t=>t < 1e3 ? t + "" : longnum(~~(t / 1e3)) + "," + ("00" + ~~(t % 1e3)).substr(-3, 3)
  , statdecimate = intmap({
    14: .1,
    13: .1,
    9: .1,
    8: .1,
    16: .1
})
  , statunit = intmap({
    14: "%",
    13: "%",
    16: "%",
    18: "%"
})
  , stat = (t,e)=>(statdecimate.has(t) && (e = (e *= statdecimate.get(t)).toFixed(e >= .1 ? 1 : 2)),
e + (statunit.get(t) || ""))
  , subscriber_queue = [];
function writable(t, e=noop) {
    let n;
    const a = [];
    function s(e) {
        if (safe_not_equal(t, e) && (t = e,
        n)) {
            const e = !subscriber_queue.length;
            for (let e = 0; e < a.length; e += 1) {
                const n = a[e];
                n[1](),
                subscriber_queue.push(n, t)
            }
            if (e) {
                for (let t = 0; t < subscriber_queue.length; t += 2)
                    subscriber_queue[t][0](subscriber_queue[t + 1]);
                subscriber_queue.length = 0
            }
        }
    }
    function r(e) {
        s(e(t))
    }
    function i(r, i=noop) {
        const o = [r, i];
        return a.push(o),
        1 === a.length && (n = e(s) || noop),
        r(t),
        ()=>{
            const t = a.indexOf(o);
            -1 !== t && a.splice(t, 1),
            0 === a.length && (n(),
            n = null)
        }
    }
    return {
        set: s,
        update: r,
        subscribe: i
    }
}
const hasloc = writable(!1)
  , buttons$1 = writable()
  , drag = writable()
  , inventoryGold = writable(0)
  , inventoryMedals = writable(0)
  , inventoryStorepoints = writable(0)
  , itemLoc = (t,e,n)=>n.items[t]["book" == t ? Math.floor(e / 5) : e]
  , itemName$1 = (t,e,n)=>itemLoc(t, e, n).name + ("book" == t ? " Lv. " + (e % 5 + 1) : "")
  , itemDescription$1 = (t,e,n)=>itemLoc(t, e, n).description
  , activeWorld = writable("")
  , lastConnectedChar = writable(0)
  , viewRange = writable(35)
  , resolution = writable(90)
  , foliage = writable(50)
  , shadowmapResolution = writable(2)
  , realtimeShadows = writable(!1)
  , fxaa = writable(!0)
  , disableoffscreen = writable(!0)
  , shadows = writable(!0)
  , bloom = writable(!0)
  , clouds = writable(!0)
  , particles = writable(!0)
  , anisotropy = writable(2)
  , fogpattern = writable(!0)
  , shadowscreature = writable(!0)
  , ambienceVolume = writable(50)
  , audioVolume = writable(65)
  , audioVolumeLowered = writable(50)
  , musicVolume = writable(20)
  , lang = writable("en")
  , command = writable("global")
  , stashCols = writable(8)
  , stashHeight = writable(300)
  , inventoryCols = writable(5)
  , inventoryOpen = writable(!1)
  , settingsOpen = writable(!1)
  , skillmenuOpen = writable(!1)
  , dpsmeterOpen = writable(!1)
  , twitchOpen = writable(!0)
  , subscriptionOpen = writable(!1)
  , clanOpen = writable(!1)
  , pvpOpen = writable(!1)
  , dpsmeterParty = writable(!0)
  , dpsmeterMode = writable(0)
  , dpsmeterTarget = writable(0)
  , charpanelOpen = writable(!1)
  , skillbarsettings = writable({})
  , chat = writable([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1])
  , cameraZoom = writable(7)
  , editorActive = writable(!1)
  , nameplateViewRange = writable(100)
  , nameplateShowMonsters = writable(!0)
  , nameplateShowFriendlyPlayers = writable(!0)
  , nameplateShowEnemyPlayers = writable(!0)
  , nameShowMonsters = writable(!0)
  , nameShowFriendlyPlayers = writable(!0)
  , nameShowEnemyPlayers = writable(!0)
  , nameplateShowTransparency = writable(!0)
  , alwaysShowLevel = writable(!1)
  , combatTextPush = writable(!0)
  , classColorBars = writable(!1)
  , mapShowMonsters = writable(!0)
  , mapLowQuality = writable(!1)
  , tutprogress = writable(0)
  , chatbubbles = writable(!0)
  , showIncomingHeal = writable(!0)
  , showIncomingDamage = writable(!0)
  , showIncomingMana = writable(!0)
  , filteredChannels = writable([])
  , itemTypeFilter = writable("")
  , itemQualityFilter = writable(0)
  , itemQualityPercent = writable(!1)
  , showFpsPing = writable(!1)
  , itemProtectQuality = writable(70)
  , cdTextSkills = writable(!0)
  , cdTextBuffs = writable(!0)
  , buffCdFlashingInterval = writable(.5)
  , buffCdFlashingDuration = writable(3)
  , partyBuffLimitUpdateRate = writable(!0)
  , partyWidth = writable(200)
  , showSelfInParty = writable(!0)
  , showPartyMana = writable(!1)
  , buffcountUnitframes = writable(14)
  , buffcountParty = writable(8)
  , buffsHideIrrelevant = writable(!1)
  , mouseSensitivity = writable(1)
  , invertMouseX = writable(!1)
  , invertMouseY = writable(!1)
  , lockedcamera = writable(!0)
  , pointerlock = writable(!0)
  , kbForward = writable("w")
  , kbTurnLeft = writable("arrowleft")
  , kbTurnRight = writable("arrowright")
  , kbAltForward = writable("arrowup")
  , kbAltBack = writable("arrowdown")
  , kbLeft = writable("a")
  , kbBack = writable("s")
  , kbRight = writable("d")
  , kbNextTarget = writable("tab")
  , kbUntarget = writable("escape")
  , kbMap = writable("m")
  , kbSkills = writable("k")
  , kbCharacter = writable("c")
  , kbInventory = writable("b")
  , kbClan = writable("g")
  , kbPvp = writable("v")
  , skillbarAmount = writable(12)
  , kbSkillbar1 = writable("1")
  , kbSkillbar2 = writable("2")
  , kbSkillbar3 = writable("3")
  , kbSkillbar4 = writable("4")
  , kbSkillbar5 = writable("5")
  , kbSkillbar6 = writable("6")
  , kbSkillbar7 = writable("7")
  , kbSkillbar8 = writable("8")
  , kbSkillbar9 = writable("9")
  , kbSkillbar10 = writable("0")
  , kbSkillbar11 = writable("o")
  , kbSkillbar12 = writable("p")
  , kbSkillbar13 = writable("")
  , kbSkillbar14 = writable("")
  , kbSkillbar15 = writable("")
  , kbSkillbar16 = writable("")
  , kbSkillbar17 = writable("")
  , kbSkillbar18 = writable("")
  , kbSkillbar19 = writable("")
  , kbSkillbar20 = writable("")
  , kbSkillbar21 = writable("")
  , kbSkillbar22 = writable("")
  , kbSkillbar23 = writable("")
  , kbSkillbar24 = writable("");
let defaults;

const itemName = (t,e)=>itemName$1(t, e, loc)
  , itemDescription = (t,e)=>itemDescription$1(t, e, loc);
function create_if_block$4(t) {
    let e, n;
    return {
        c() {
            e = element("img"),
            attr(e, "class", "icon svelte-erbdzy"),
            e.src !== (n = "/assets/ui/icons/gem.svg?v=5700123") && attr(e, "src", n)
        },
        m(t, n) {
            insert(t, e, n)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_fragment$8(t) {
    let e, n, a, s, r, i, o, l, c = t[4] && create_if_block$4();
    return {
        c() {
            e = element("span"),
            c && c.c(),
            n = element("img"),
            s = text(t[1]),
            r = space(),
            i = element("span"),
            o = text(t[0]),
            attr(n, "class", "icon svelte-erbdzy"),
            n.src !== (a = pclass(t[2])) && attr(n, "src", a),
            attr(e, "class", "textwhite"),
            attr(i, "class", l = "name textf" + t[3] + " svelte-erbdzy")
        },
        m(t, a) {
            insert(t, e, a),
            c && c.m(e, null),
            append(e, n),
            append(e, s),
            append(e, r),
            insert(t, i, a),
            append(i, o)
        },
        p(t, [r]) {
            t[4] ? c || (c = create_if_block$4(),
            c.c(),
            c.m(e, n)) : c && (c.d(1),
            c = null),
            4 & r && n.src !== (a = pclass(t[2])) && attr(n, "src", a),
            2 & r && set_data(s, t[1]),
            1 & r && set_data(o, t[0]),
            8 & r && l !== (l = "name textf" + t[3] + " svelte-erbdzy") && attr(i, "class", l)
        },
        i: noop,
        o: noop,
        d(t) {
            t && detach(e),
            c && c.d(),
            t && detach(i)
        }
    }
}
function instance$8(t, e, n) {
    let {name: a} = e
      , {level: s} = e
      , {pclass: r} = e
      , {faction: i} = e
      , {sub: o=!1} = e;
    return t.$$set = t=>{
        "name"in t && n(0, a = t.name),
        "level"in t && n(1, s = t.level),
        "pclass"in t && n(2, r = t.pclass),
        "faction"in t && n(3, i = t.faction),
        "sub"in t && n(4, o = t.sub)
    }
    ,
    [a, s, r, i, o]
}
class Playertext extends SvelteComponent {
    constructor(t) {
        super(),
        init(this, t, instance$8, create_fragment$8, safe_not_equal, {
            name: 0,
            level: 1,
            pclass: 2,
            faction: 3,
            sub: 4
        })
    }
}
const formatDurationDot = t=>{
    const e = [~~(t / 86400), ~~(t / 3600 % 24), ~~(t / 60 % 60), ~~(t % 60)];
    let n = ""
      , a = !1;
    for (let t = 0; t < 4; ++t) {
        const s = e[t];
        (s > 0 || t >= 2) && ((a || 3 === t) && (n += ":",
        s < 10 && (n += "0")),
        (s > 0 || a || t >= 2) && (n += s,
        a = !0))
    }
    return n
}
;
function create_fragment$7(t) {
    let e, n, a, s, r, i, o, l, c;
    const d = t[7].default
      , p = create_slot(d, t, t[6], null);
    return {
        c() {
            e = element("div"),
            n = element("div"),
            a = element("span"),
            s = text(t[0]),
            r = element("span"),
            i = text(t[1]),
            p && p.c(),
            attr(a, "class", "left svelte-i7i7g5"),
            attr(r, "class", "right svelte-i7i7g5"),
            attr(n, "class", o = "progressBar " + t[3] + " svelte-i7i7g5"),
            set_style(n, "width", t[2] + "%"),
            set_style(n, "font-size", t[4]),
            attr(e, "class", l = "bar " + (t[5] ? "dark" : "") + " svelte-i7i7g5"),
            set_style(e, "z-index", "hp" == t[3] ? "1" : "0")
        },
        m(t, o) {
            insert(t, e, o),
            append(e, n),
            append(n, a),
            append(a, s),
            append(n, r),
            append(r, i),
            p && p.m(e, null),
            c = !0
        },
        p(t, [a]) {
            (!c || 1 & a) && set_data(s, t[0]),
            (!c || 2 & a) && set_data(i, t[1]),
            (!c || 8 & a && o !== (o = "progressBar " + t[3] + " svelte-i7i7g5")) && attr(n, "class", o),
            (!c || 4 & a) && set_style(n, "width", t[2] + "%"),
            (!c || 16 & a) && set_style(n, "font-size", t[4]),
            p && p.p && 64 & a && update_slot(p, d, t, t[6], a, null, null),
            (!c || 32 & a && l !== (l = "bar " + (t[5] ? "dark" : "") + " svelte-i7i7g5")) && attr(e, "class", l),
            (!c || 8 & a) && set_style(e, "z-index", "hp" == t[3] ? "1" : "0")
        },
        i(t) {
            c || (transition_in(p, t),
            c = !0)
        },
        o(t) {
            transition_out(p, t),
            c = !1
        },
        d(t) {
            t && detach(e),
            p && p.d(t)
        }
    }
}
function instance$7(t, e, n) {
    let {left: a=""} = e
      , {right: s=""} = e
      , {fract: r} = e
      , {barcol: i} = e
      , {size: o} = e
      , {darken: l} = e
      , {$$slots: c={}, $$scope: d} = e;
    return t.$$set = t=>{
        "left"in t && n(0, a = t.left),
        "right"in t && n(1, s = t.right),
        "fract"in t && n(2, r = t.fract),
        "barcol"in t && n(3, i = t.barcol),
        "size"in t && n(4, o = t.size),
        "darken"in t && n(5, l = t.darken),
        "$$scope"in t && n(6, d = t.$$scope)
    }
    ,
    [a, s, r, i, o, l, d, c]
}
class Bar extends SvelteComponent {
    constructor(t) {
        super(),
        init(this, t, instance$7, create_fragment$7, not_equal, {
            left: 0,
            right: 1,
            fract: 2,
            barcol: 3,
            size: 4,
            darken: 5
        })
    }
}
const C = {
    SECONDS_A_MINUTE: 60,
    SECONDS_A_HOUR: 3600,
    SECONDS_A_DAY: 86400,
    SECONDS_A_WEEK: 604800,
    MILLISECONDS_A_SECOND: 1e3,
    MILLISECONDS_A_MINUTE: 6e4,
    MILLISECONDS_A_HOUR: 36e5,
    MILLISECONDS_A_DAY: 864e5,
    MILLISECONDS_A_WEEK: 6048e5,
    MS: "millisecond",
    S: "second",
    MIN: "minute",
    H: "hour",
    D: "day",
    W: "week",
    M: "month",
    Q: "quarter",
    Y: "year",
    DATE: "date",
    FORMAT_DEFAULT: "YYYY-MM-DDTHH:mm:ssZ",
    INVALID_DATE_STRING: "Invalid Date",
    REGEX_PARSE: /^(\d{4})-?(\d{1,2})-?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d{1,3})?$/,
    REGEX_FORMAT: /\[([^\]]+)]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g
}
  , padStart = (t,e,n)=>{
    const a = String(t);
    return !a || a.length >= e ? t : `${Array(e + 1 - a.length).join(n)}${t}`
}
  , padZoneStr = t=>{
    const e = -t.utcOffset()
      , n = Math.abs(e)
      , a = Math.floor(n / 60)
      , s = n % 60;
    return `${e <= 0 ? "+" : "-"}${padStart(a, 2, "0")}:${padStart(s, 2, "0")}`
}
  , U = {
    s: padStart,
    z: padZoneStr,
    m: (t,e)=>{
        const n = 12 * (e.year() - t.year()) + (e.month() - t.month())
          , a = t.clone().add(n, C.M)
          , s = e - a < 0
          , r = t.clone().add(n + (s ? -1 : 1), C.M);
        return Number(-(n + (e - a) / (s ? a - r : r - a)) || 0)
    }
    ,
    a: t=>t < 0 ? Math.ceil(t) || 0 : Math.floor(t),
    p: t=>({
        M: C.M,
        y: C.Y,
        w: C.W,
        d: C.D,
        h: C.H,
        m: C.MIN,
        s: C.S,
        ms: C.MS,
        Q: C.Q
    }[t] || String(t || "").toLowerCase().replace(/s$/, "")),
    u: t=>void 0 === t
}
  , en = {
    name: "en",
    weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_")
};
let L = "en";
const Ls = {};
Ls[L] = en;
const isDayjs = t=>t instanceof Dayjs
  , parseLocale = (t,e,n)=>{
    let a;
    if (!t)
        return L;
    if ("string" == typeof t)
        Ls[t] && (a = t),
        e && (Ls[t] = e,
        a = t);
    else {
        const {name: e} = t;
        Ls[e] = t,
        a = e
    }
    return n || (L = a),
    a
}
  , dayjs = (t,e,n)=>{
    if (isDayjs(t))
        return t.clone();
    const a = e ? "string" == typeof e ? {
        format: e,
        pl: n
    } : e : {};
    return a.date = t,
    new Dayjs(a)
}
  , wrapper = (t,e)=>dayjs(t, {
    locale: e.$L,
    utc: e.$u,
    $offset: e.$offset
})
  , Utils = U;
Utils.l = parseLocale,
Utils.i = isDayjs,
Utils.w = wrapper;
const parseDate = t=>{
    const {date: e, utc: n} = t;
    if (null === e)
        return new Date(NaN);
    if (Utils.u(e))
        return new Date;
    if (e instanceof Date)
        return new Date(e);
    if ("string" == typeof e && !/Z$/i.test(e)) {
        const t = e.match(C.REGEX_PARSE);
        if (t)
            return n ? new Date(Date.UTC(t[1], t[2] - 1, t[3] || 1, t[4] || 0, t[5] || 0, t[6] || 0, t[7] || 0)) : new Date(t[1],t[2] - 1,t[3] || 1,t[4] || 0,t[5] || 0,t[6] || 0,t[7] || 0)
    }
    return new Date(e)
}
;
class Dayjs {
    constructor(t) {
        this.$L = this.$L || parseLocale(t.locale, null, !0),
        this.parse(t)
    }
    parse(t) {
        this.$d = parseDate(t),
        this.init()
    }
    init() {
        const {$d: t} = this;
        this.$y = t.getFullYear(),
        this.$M = t.getMonth(),
        this.$D = t.getDate(),
        this.$W = t.getDay(),
        this.$H = t.getHours(),
        this.$m = t.getMinutes(),
        this.$s = t.getSeconds(),
        this.$ms = t.getMilliseconds()
    }
    $utils() {
        return Utils
    }
    isValid() {
        return !(this.$d.toString() === C.INVALID_DATE_STRING)
    }
    isSame(t, e) {
        const n = dayjs(t);
        return this.startOf(e) <= n && n <= this.endOf(e)
    }
    isAfter(t, e) {
        return dayjs(t) < this.startOf(e)
    }
    isBefore(t, e) {
        return this.endOf(e) < dayjs(t)
    }
    $g(t, e, n) {
        return Utils.u(t) ? this[e] : this.set(n, t)
    }
    year(t) {
        return this.$g(t, "$y", C.Y)
    }
    month(t) {
        return this.$g(t, "$M", C.M)
    }
    day(t) {
        return this.$g(t, "$W", C.D)
    }
    date(t) {
        return this.$g(t, "$D", C.DATE)
    }
    hour(t) {
        return this.$g(t, "$H", C.H)
    }
    minute(t) {
        return this.$g(t, "$m", C.MIN)
    }
    second(t) {
        return this.$g(t, "$s", C.S)
    }
    millisecond(t) {
        return this.$g(t, "$ms", C.MS)
    }
    unix() {
        return Math.floor(this.valueOf() / 1e3)
    }
    valueOf() {
        return this.$d.getTime()
    }
    startOf(t, e) {
        const n = !!Utils.u(e) || e
          , a = Utils.p(t)
          , s = (t,e)=>{
            const a = Utils.w(this.$u ? Date.UTC(this.$y, e, t) : new Date(this.$y,e,t), this);
            return n ? a : a.endOf(C.D)
        }
          , r = (t,e)=>{
            const a = [0, 0, 0, 0]
              , s = [23, 59, 59, 999];
            return Utils.w(this.toDate()[t].apply(this.toDate(), (n ? a : s).slice(e)), this)
        }
          , {$W: i, $M: o, $D: l} = this
          , c = "set" + (this.$u ? "UTC" : "");
        switch (a) {
        case C.Y:
            return n ? s(1, 0) : s(31, 11);
        case C.M:
            return n ? s(1, o) : s(0, o + 1);
        case C.W:
            {
                const t = this.$locale().weekStart || 0
                  , e = (i < t ? i + 7 : i) - t;
                return s(n ? l - e : l + (6 - e), o)
            }
        case C.D:
        case C.DATE:
            return r(c + "Hours", 0);
        case C.H:
            return r(c + "Minutes", 1);
        case C.MIN:
            return r(c + "Seconds", 2);
        case C.S:
            return r(c + "Milliseconds", 3);
        default:
            return this.clone()
        }
    }
    endOf(t) {
        return this.startOf(t, !1)
    }
    $set(t, e) {
        const n = Utils.p(t)
          , a = "set" + (this.$u ? "UTC" : "")
          , s = {
            [C.D]: a + "Date",
            [C.DATE]: a + "Date",
            [C.M]: a + "Month",
            [C.Y]: a + "FullYear",
            [C.H]: a + "Hours",
            [C.MIN]: a + "Minutes",
            [C.S]: a + "Seconds",
            [C.MS]: a + "Milliseconds"
        }[n]
          , r = n === C.D ? this.$D + (e - this.$W) : e;
        if (n === C.M || n === C.Y) {
            const t = this.clone().set(C.DATE, 1);
            t.$d[s](r),
            t.init(),
            this.$d = t.set(C.DATE, Math.min(this.$D, t.daysInMonth())).toDate()
        } else
            s && this.$d[s](r);
        return this.init(),
        this
    }
    set(t, e) {
        return this.clone().$set(t, e)
    }
    get(t) {
        return this[Utils.p(t)]()
    }
    add(t, e) {
        t = Number(t);
        const n = Utils.p(e)
          , a = e=>{
            const n = dayjs(this);
            return Utils.w(n.date(n.date() + Math.round(e * t)), this)
        }
        ;
        if (n === C.M)
            return this.set(C.M, this.$M + t);
        if (n === C.Y)
            return this.set(C.Y, this.$y + t);
        if (n === C.D)
            return a(1);
        if (n === C.W)
            return a(7);
        const s = {
            [C.MIN]: C.MILLISECONDS_A_MINUTE,
            [C.H]: C.MILLISECONDS_A_HOUR,
            [C.S]: C.MILLISECONDS_A_SECOND
        }[n] || 1
          , r = this.$d.getTime() + t * s;
        return Utils.w(r, this)
    }
    subtract(t, e) {
        return this.add(-1 * t, e)
    }
    format(t) {
        if (!this.isValid())
            return C.INVALID_DATE_STRING;
        const e = t || C.FORMAT_DEFAULT
          , n = Utils.z(this)
          , a = this.$locale()
          , {$H: s, $m: r, $M: i} = this
          , {weekdays: o, months: l, meridiem: c} = a
          , d = (t,n,a,s)=>t && (t[n] || t(this, e)) || a[n].substr(0, s)
          , p = t=>Utils.s(s % 12 || 12, t, "0")
          , u = c || ((t,e,n)=>{
            const a = t < 12 ? "AM" : "PM";
            return n ? a.toLowerCase() : a
        }
        )
          , m = {
            YY: String(this.$y).slice(-2),
            YYYY: this.$y,
            M: i + 1,
            MM: Utils.s(i + 1, 2, "0"),
            MMM: d(a.monthsShort, i, l, 3),
            MMMM: l[i] || l(this, e),
            D: this.$D,
            DD: Utils.s(this.$D, 2, "0"),
            d: String(this.$W),
            dd: d(a.weekdaysMin, this.$W, o, 2),
            ddd: d(a.weekdaysShort, this.$W, o, 3),
            dddd: o[this.$W],
            H: String(s),
            HH: Utils.s(s, 2, "0"),
            h: p(1),
            hh: p(2),
            a: u(s, r, !0),
            A: u(s, r, !1),
            m: String(r),
            mm: Utils.s(r, 2, "0"),
            s: String(this.$s),
            ss: Utils.s(this.$s, 2, "0"),
            SSS: Utils.s(this.$ms, 3, "0"),
            Z: n
        };
        return e.replace(C.REGEX_FORMAT, (t,e)=>e || m[t] || n.replace(":", ""))
    }
    utcOffset() {
        return 15 * -Math.round(this.$d.getTimezoneOffset() / 15)
    }
    diff(t, e, n) {
        const a = Utils.p(e)
          , s = dayjs(t)
          , r = (s.utcOffset() - this.utcOffset()) * C.MILLISECONDS_A_MINUTE
          , i = this - s;
        let o = Utils.m(this, s);
        return o = {
            [C.Y]: o / 12,
            [C.M]: o,
            [C.Q]: o / 3,
            [C.W]: (i - r) / C.MILLISECONDS_A_WEEK,
            [C.D]: (i - r) / C.MILLISECONDS_A_DAY,
            [C.H]: i / C.MILLISECONDS_A_HOUR,
            [C.MIN]: i / C.MILLISECONDS_A_MINUTE,
            [C.S]: i / C.MILLISECONDS_A_SECOND
        }[a] || i,
        n ? o : Utils.a(o)
    }
    daysInMonth() {
        return this.endOf(C.M).$D
    }
    $locale() {
        return Ls[this.$L]
    }
    locale(t, e) {
        if (!t)
            return this.$L;
        const n = this.clone();
        return n.$L = parseLocale(t, e, !0),
        n
    }
    clone() {
        return Utils.w(this.$d, this)
    }
    toDate() {
        return new Date(this.valueOf())
    }
    toJSON() {
        return this.isValid() ? this.toISOString() : null
    }
    toISOString() {
        return this.$d.toISOString()
    }
    toString() {
        return this.$d.toUTCString()
    }
}
function length(t) {
    const e = t[0]
      , n = t[1];
    return Math.sqrt(e * e + n * n)
}
let world;
dayjs.prototype = Dayjs.prototype,
dayjs.extend = (t,e)=>(t(e, Dayjs, dayjs),
dayjs),
dayjs.locale = parseLocale,
dayjs.isDayjs = isDayjs,
dayjs.unix = t=>dayjs(1e3 * t),
dayjs.en = Ls[L],
dayjs.Ls = Ls;
let offset = 0;
const dynamicByteCounts = {
    string: t=>{
        const e = stringByteLength(t);
        return getVarUIntByteLength(e) + e
    }
    ,
    varuint: t=>getVarUIntByteLength(t),
    varint: t=>getVarIntByteLength(t),
    buffer8: t=>{
        const e = t.length;
        return getVarUIntByteLength(e) + e
    }
    ,
    buffer16: (t,e)=>{
        const n = 2 * t.length;
        let a = getVarUIntByteLength(n);
        return (e + a) % 2 == 1 && a++,
        a + n
    }
}
  , readVarUInt = t=>{
    let e = 0
      , n = 0
      , a = 0;
    do {
        a = t[offset++],
        e |= (127 & a) << 7 * n,
        n++
    } while (128 & a);
    return e
}
  , writeVarUInt = (t,e)=>{
    for (; e > 127; )
        t[offset++] = 127 & e | 128,
        e >>= 7;
    t[offset++] = 127 & e
}
  , getVarUIntByteLength = t=>t <= 0 ? 1 : Math.floor(Math.log(t) / Math.log(128)) + 1
  , getVarIntByteLength = t=>getVarUIntByteLength(t << 1 ^ t >> 31)
  , readInt8 = t=>128 & t[offset] ? -1 * (255 - t[offset] + 1) : t[offset]
  , writeInt8 = (t,e)=>{
    e < 0 && (e = 255 + e + 1),
    t[offset] = 255 & e,
    offset += 1
}
  , readUInt8 = t=>t[offset]
  , writeUInt8 = (t,e)=>{
    t[offset] = e,
    offset += 1
}
  , writeInt16LE = (t,e)=>{
    t[offset] = 255 & e,
    t[offset + 1] = e >>> 8,
    offset += 2
}
  , readUInt16LE = t=>t[offset] | t[offset + 1] << 8
  , readUInt32LE = t=>(t[offset] | t[offset + 1] << 8 | t[offset + 2] << 16) + 16777216 * t[offset + 3]
  , writeUInt32LE = (t,e)=>{
    t[offset] = 255 & e,
    t[offset + 1] = e >>> 8,
    t[offset + 2] = e >>> 16,
    t[offset + 3] = e >>> 24,
    offset += 4
}
  , helper = new ArrayBuffer(8)
  , h8 = new Uint8Array(helper)
  , h32 = new Float32Array(helper)
  , readFloat32LE = t=>(h8[0] = t[offset],
h8[1] = t[offset + 1],
h8[2] = t[offset + 2],
h8[3] = t[offset + 3],
h32[0])
  , writeFloat32LE = (t,e)=>{
    h32[0] = e,
    t[offset] = h8[0],
    t[offset + 1] = h8[1],
    t[offset + 2] = h8[2],
    t[offset + 3] = h8[3],
    offset += 4
}
  , stringByteLength = t=>{
    let e = t.length;
    for (let n = t.length - 1; n >= 0; n--) {
        const a = t.charCodeAt(n);
        a > 127 && a <= 2047 ? e++ : a > 2047 && a <= 65535 && (e += 2),
        a >= 56320 && a <= 57343 && n--
    }
    return e
}
  , writeString = (t,e)=>{
    const n = stringByteLength(e);
    writeVarUInt(t, n);
    for (let n = 0; n < e.length; n++) {
        let a = e.charCodeAt(n);
        a < 128 ? t[offset++] = a : a < 2048 ? (t[offset++] = a >> 6 | 192,
        t[offset++] = 63 & a | 128) : 55296 == (64512 & a) && n + 1 < e.length && 56320 == (64512 & e.charCodeAt(n + 1)) ? (a = 65536 + ((1023 & a) << 10) + (1023 & e.charCodeAt(++n)),
        t[offset++] = a >> 18 | 240,
        t[offset++] = a >> 12 & 63 | 128,
        t[offset++] = a >> 6 & 63 | 128,
        t[offset++] = 63 & a | 128) : (t[offset++] = a >> 12 | 224,
        t[offset++] = a >> 6 & 63 | 128,
        t[offset++] = 63 & a | 128)
    }
}
  , readString = t=>{
    const e = readVarUInt(t);
    let n = "";
    const a = offset + e;
    for (; offset < a; ) {
        const e = t[offset++];
        if (e < 128)
            n += String.fromCharCode(e);
        else if (e > 191 && e < 224) {
            const a = t[offset++];
            n += String.fromCharCode((31 & e) << 6 | 63 & a)
        } else if (e > 239 && e < 365) {
            const a = ((7 & e) << 18 | (63 & t[offset++]) << 12 | (63 & t[offset++]) << 6 | 63 & t[offset++]) - 65536;
            n += String.fromCharCode(55296 + (a >> 10)),
            n += String.fromCharCode(56320 + (1023 & a))
        } else {
            const a = t[offset++]
              , s = t[offset++];
            n += String.fromCharCode((15 & e) << 12 | (63 & a) << 6 | 63 & s)
        }
    }
    return n
}
  , netSchemas = {
    clientPlayerInput: {
        decode: t=>{
            const e = t
              , n = {};
            offset = 0,
            n._header = readUInt8(e),
            offset += 1;
            const a = [];
            n.doubles = a;
            const s = readVarUInt(e);
            for (let t = 0; t < s; t++)
                a[t] = readFloat32LE(e),
                offset += 4;
            const r = [];
            n.int8s = r;
            const i = readVarUInt(e);
            for (let t = 0; t < i; t++)
                r[t] = readInt8(e),
                offset += 1;
            const o = [];
            n.uint16s = o;
            const l = readVarUInt(e);
            for (let t = 0; t < l; t++)
                o[t] = readUInt16LE(e),
                offset += 2;
            const c = [];
            n.uint8s = c;
            const d = readVarUInt(e);
            for (let t = 0; t < d; t++)
                c[t] = readUInt8(e),
                offset += 1;
            return n
        }
        ,
        encode: t=>{
            const e = t
              , n = e.doubles
              , a = e.int8s
              , s = e.uint16s
              , r = e.uint8s;
            let i = 0;
            i += 1,
            i += getVarUIntByteLength(n.length);
            for (let t = 0; t < n.length; t++)
                i += 4;
            i += getVarUIntByteLength(a.length);
            for (let t = 0; t < a.length; t++)
                i += 1;
            i += getVarUIntByteLength(s.length);
            for (let t = 0; t < s.length; t++)
                i += 2;
            i += getVarUIntByteLength(r.length);
            for (let t = 0; t < r.length; t++)
                i += 1;
            const o = new Uint8Array(i);
            offset = 0,
            writeUInt8(o, e._header),
            writeVarUInt(o, n.length);
            for (let t = 0; t < n.length; t++)
                writeFloat32LE(o, n[t]);
            writeVarUInt(o, a.length);
            for (let t = 0; t < a.length; t++)
                writeInt8(o, a[t]);
            writeVarUInt(o, s.length);
            for (let t = 0; t < s.length; t++)
                writeInt16LE(o, s[t]);
            writeVarUInt(o, r.length);
            for (let t = 0; t < r.length; t++)
                writeUInt8(o, r[t]);
            return o
        }
    },
    clientPlayerChangeTarget: {
        decode: t=>{
            const e = t
              , n = {};
            return offset = 0,
            n._header = readUInt8(e),
            offset += 1,
            n.target = readUInt16LE(e),
            offset += 2,
            n
        }
        ,
        encode: t=>{
            const e = t;
            let n = 0;
            n += 1,
            n += 2;
            const a = new Uint8Array(n);
            return offset = 0,
            writeUInt8(a, e._header),
            writeInt16LE(a, e.target),
            a
        }
    },
    clientPlayerSkill: {
        decode: t=>{
            const e = t
              , n = {};
            offset = 0,
            n._header = readUInt8(e),
            offset += 1,
            n.id = readUInt16LE(e),
            offset += 2;
            const a = [];
            n.info = a;
            const s = readVarUInt(e);
            for (let t = 0; t < s; t++)
                a[t] = readUInt32LE(e),
                offset += 4;
            return n
        }
        ,
        encode: t=>{
            const e = t
              , n = e.info;
            let a = 0;
            a += 1,
            a += 2,
            a += getVarUIntByteLength(n.length);
            for (let t = 0; t < n.length; t++)
                a += 4;
            const s = new Uint8Array(a);
            offset = 0,
            writeUInt8(s, e._header),
            writeInt16LE(s, e.id),
            writeVarUInt(s, n.length);
            for (let t = 0; t < n.length; t++)
                writeUInt32LE(s, n[t]);
            return s
        }
    },
    clientPlayerEnvSkill: {
        decode: t=>{
            const e = t
              , n = {};
            offset = 0,
            n._header = readUInt8(e),
            offset += 1,
            n.id = readUInt16LE(e),
            offset += 2;
            const a = [];
            n.info = a;
            const s = readVarUInt(e);
            for (let t = 0; t < s; t++)
                a[t] = readUInt32LE(e),
                offset += 4;
            const r = [];
            n.pos = r;
            const i = readVarUInt(e);
            for (let t = 0; t < i; t++)
                r[t] = readFloat32LE(e),
                offset += 4;
            return n
        }
        ,
        encode: t=>{
            const e = t
              , n = e.info
              , a = e.pos;
            let s = 0;
            s += 1,
            s += 2,
            s += getVarUIntByteLength(n.length);
            for (let t = 0; t < n.length; t++)
                s += 4;
            s += getVarUIntByteLength(a.length);
            for (let t = 0; t < a.length; t++)
                s += 4;
            const r = new Uint8Array(s);
            offset = 0,
            writeUInt8(r, e._header),
            writeInt16LE(r, e.id),
            writeVarUInt(r, n.length);
            for (let t = 0; t < n.length; t++)
                writeUInt32LE(r, n[t]);
            writeVarUInt(r, a.length);
            for (let t = 0; t < a.length; t++)
                writeFloat32LE(r, a[t]);
            return r
        }
    },
    clientPlayerInteract: {
        decode: t=>{
            const e = t
              , n = {};
            return offset = 0,
            n._header = readUInt8(e),
            offset += 1,
            n.id = readUInt8(e),
            offset += 1,
            n
        }
        ,
        encode: t=>{
            const e = t;
            let n = 0;
            n += 1,
            n += 1;
            const a = new Uint8Array(n);
            return offset = 0,
            writeUInt8(a, e._header),
            writeUInt8(a, e.id),
            a
        }
    },
    clientCommand: {
        decode: t=>{
            const e = t
              , n = {};
            return offset = 0,
            n._header = readUInt8(e),
            offset += 1,
            n.command = readString(e),
            n.string = readString(e),
            n
        }
        ,
        encode: t=>{
            const e = t;
            let n = 0;
            n += 1,
            n += dynamicByteCounts.string(e.command, n),
            n += dynamicByteCounts.string(e.string, n);
            const a = new Uint8Array(n);
            return offset = 0,
            writeUInt8(a, e._header),
            writeString(a, e.command),
            writeString(a, e.string),
            a
        }
    },
    serverOnClientConnect: {
        decode: t=>{
            const e = t
              , n = {};
            return offset = 0,
            n._header = readUInt8(e),
            offset += 1,
            n.file = readString(e),
            n.playerId = readUInt16LE(e),
            offset += 2,
            n.tickId = readUInt32LE(e),
            offset += 4,
            n.world = readString(e),
            n
        }
        ,
        encode: t=>{
            const e = t;
            let n = 0;
            n += 1,
            n += dynamicByteCounts.string(e.file, n),
            n += 2,
            n += 4,
            n += dynamicByteCounts.string(e.world, n);
            const a = new Uint8Array(n);
            return offset = 0,
            writeUInt8(a, e._header),
            writeString(a, e.file),
            writeInt16LE(a, e.playerId),
            writeUInt32LE(a, e.tickId),
            writeString(a, e.world),
            a
        }
    },
    serverEntityDelta: {
        decode: t=>{
            const e = t
              , n = {};
            offset = 0,
            n._header = readUInt8(e),
            offset += 1;
            const a = [];
            n.inputs = a;
            const s = readVarUInt(e);
            for (let t = 0; t < s; t++) {
                const n = {};
                a[t] = n,
                n.id = readUInt16LE(e),
                offset += 2,
                n.jump = readUInt8(e),
                offset += 1,
                n.rot = readFloat32LE(e),
                offset += 4,
                n.speed = readUInt16LE(e),
                offset += 2;
                const s = [];
                n.steer = s,
                s[0] = readInt8(e),
                offset += 1;
                const r = readVarUInt(e);
                for (let t = 1; t < r; t++)
                    s[t] = readInt8(e),
                    offset += 1
            }
            const r = [];
            n.log = r;
            const i = readVarUInt(e);
            for (let t = 0; t < i; t++) {
                const n = {};
                r[t] = n;
                const a = [];
                n.data = a,
                n.type = readUInt8(e),
                offset += 1;
                const s = readVarUInt(e);
                for (let t = 0; t < s; t++)
                    a[t] = readVarUInt(e)
            }
            const o = [];
            n.logPersonal = o;
            const l = readVarUInt(e);
            for (let t = 0; t < l; t++) {
                const n = {};
                o[t] = n;
                const a = [];
                n.data = a,
                n.type = readUInt8(e),
                offset += 1;
                const s = readVarUInt(e);
                for (let t = 0; t < s; t++)
                    a[t] = readVarUInt(e)
            }
            const c = [];
            n.movements = c;
            const d = readVarUInt(e);
            for (let t = 0; t < d; t++) {
                const n = {};
                c[t] = n,
                n.id = readUInt16LE(e),
                offset += 2;
                const a = [];
                n.pos = a,
                a[0] = readFloat32LE(e),
                offset += 4,
                a[1] = readFloat32LE(e),
                offset += 4;
                const s = [];
                n.vel = s,
                s[0] = readFloat32LE(e),
                offset += 4,
                s[1] = readFloat32LE(e),
                offset += 4;
                const r = readVarUInt(e);
                for (let t = 2; t < r; t++) {
                    s[t] = readFloat32LE(e),
                    offset += 4;
                    const n = readVarUInt(e);
                    for (let t = 2; t < n; t++)
                        a[t] = readFloat32LE(e),
                        offset += 4
                }
            }
            return n.tickId = readUInt32LE(e),
            offset += 4,
            n
        }
        ,
        encode: t=>{
            const e = t
              , n = e.inputs
              , a = e.log
              , s = e.logPersonal
              , r = e.movements;
            let i = 0;
            i += 1,
            i += getVarUIntByteLength(n.length);
            for (let t = 0; t < n.length; t++) {
                i += 2,
                i += 1,
                i += 4,
                i += 2;
                const e = n[t].steer;
                i += 1,
                i += getVarUIntByteLength(e.length);
                for (let t = 1; t < e.length; t++)
                    i += 1
            }
            i += getVarUIntByteLength(a.length);
            for (let t = 0; t < a.length; t++) {
                const e = a[t].data;
                i += 1,
                i += getVarUIntByteLength(e.length);
                for (let t = 0; t < e.length; t++)
                    i += dynamicByteCounts.varuint(e[t], i)
            }
            i += getVarUIntByteLength(s.length);
            for (let t = 0; t < s.length; t++) {
                const e = s[t].data;
                i += 1,
                i += getVarUIntByteLength(e.length);
                for (let t = 0; t < e.length; t++)
                    i += dynamicByteCounts.varuint(e[t], i)
            }
            i += getVarUIntByteLength(r.length);
            for (let t = 0; t < r.length; t++) {
                const e = r[t];
                i += 2;
                const n = e.pos;
                i += 4,
                i += 4;
                const a = e.vel;
                i += 4,
                i += 4,
                i += getVarUIntByteLength(a.length);
                for (let t = 2; t < a.length; t++) {
                    i += 4,
                    i += getVarUIntByteLength(n.length);
                    for (let t = 2; t < n.length; t++)
                        i += 4
                }
            }
            i += 4;
            const o = new Uint8Array(i);
            offset = 0,
            writeUInt8(o, e._header),
            writeVarUInt(o, n.length);
            for (let t = 0; t < n.length; t++) {
                const e = n[t];
                writeInt16LE(o, e.id),
                writeUInt8(o, e.jump),
                writeFloat32LE(o, e.rot),
                writeInt16LE(o, e.speed);
                const a = e.steer;
                writeInt8(o, a[0]),
                writeVarUInt(o, a.length);
                for (let t = 1; t < a.length; t++)
                    writeInt8(o, a[t])
            }
            writeVarUInt(o, a.length);
            for (let t = 0; t < a.length; t++) {
                const e = a[t]
                  , n = e.data;
                writeUInt8(o, e.type),
                writeVarUInt(o, n.length);
                for (let t = 0; t < n.length; t++)
                    writeVarUInt(o, n[t])
            }
            writeVarUInt(o, s.length);
            for (let t = 0; t < s.length; t++) {
                const e = s[t]
                  , n = e.data;
                writeUInt8(o, e.type),
                writeVarUInt(o, n.length);
                for (let t = 0; t < n.length; t++)
                    writeVarUInt(o, n[t])
            }
            writeVarUInt(o, r.length);
            for (let t = 0; t < r.length; t++) {
                const e = r[t];
                writeInt16LE(o, e.id);
                const n = e.pos;
                writeFloat32LE(o, n[0]),
                writeFloat32LE(o, n[1]);
                const a = e.vel;
                writeFloat32LE(o, a[0]),
                writeFloat32LE(o, a[1]),
                writeVarUInt(o, a.length);
                for (let t = 2; t < a.length; t++) {
                    writeFloat32LE(o, a[t]),
                    writeVarUInt(o, n.length);
                    for (let t = 2; t < n.length; t++)
                        writeFloat32LE(o, n[t])
                }
            }
            return writeUInt32LE(o, e.tickId),
            o
        }
    },
    serverPartyUpdate: {
        decode: t=>{
            const e = t
              , n = {};
            offset = 0,
            n._header = readUInt8(e),
            offset += 1;
            const a = [];
            n.members = a;
            const s = readVarUInt(e);
            for (let t = 0; t < s; t++) {
                const n = {};
                a[t] = n,
                n.class = readUInt8(e),
                offset += 1,
                n.entityid = readUInt16LE(e),
                offset += 2,
                n.level = readUInt8(e),
                offset += 1,
                n.name = readString(e),
                n.role = readUInt16LE(e),
                offset += 2,
                n.world = readString(e)
            }
            const r = [];
            n.queues = r;
            const i = readVarUInt(e);
            for (let t = 0; t < i; t++)
                r[t] = readString(e);
            return n
        }
        ,
        encode: t=>{
            const e = t
              , n = e.members
              , a = e.queues;
            let s = 0;
            s += 1,
            s += getVarUIntByteLength(n.length);
            for (let t = 0; t < n.length; t++) {
                const e = n[t];
                s += 1,
                s += 2,
                s += 1,
                s += dynamicByteCounts.string(e.name, s),
                s += 2,
                s += dynamicByteCounts.string(e.world, s)
            }
            s += getVarUIntByteLength(a.length);
            for (let t = 0; t < a.length; t++)
                s += dynamicByteCounts.string(a[t], s);
            const r = new Uint8Array(s);
            offset = 0,
            writeUInt8(r, e._header),
            writeVarUInt(r, n.length);
            for (let t = 0; t < n.length; t++) {
                const e = n[t];
                writeUInt8(r, e.class),
                writeInt16LE(r, e.entityid),
                writeUInt8(r, e.level),
                writeString(r, e.name),
                writeInt16LE(r, e.role),
                writeString(r, e.world)
            }
            writeVarUInt(r, a.length);
            for (let t = 0; t < a.length; t++)
                writeString(r, a[t]);
            return r
        }
    },
    serverWarUpdate: {
        decode: t=>{
            const e = t
              , n = {};
            offset = 0,
            n._header = readUInt8(e),
            offset += 1,
            n.contrib = readVarUInt(e);
            const a = [];
            n.contributors = a;
            const s = readVarUInt(e);
            for (let t = 0; t < s; t++) {
                const n = {};
                a[t] = n,
                n.class = readUInt8(e),
                offset += 1,
                n.faction = readUInt8(e),
                offset += 1,
                n.level = readUInt8(e),
                offset += 1,
                n.name = readString(e);
                const s = [];
                n.stats = s;
                const r = readVarUInt(e);
                for (let t = 0; t < r; t++)
                    s[t] = readVarUInt(e)
            }
            n.duration = readVarUInt(e);
            const r = [];
            n.kills = r,
            r[0] = readVarUInt(e);
            const i = readVarUInt(e);
            for (let t = 1; t < i; t++)
                r[t] = readVarUInt(e);
            return n.level = readVarUInt(e),
            n.reward = readVarUInt(e),
            n.status = readUInt8(e),
            offset += 1,
            n
        }
        ,
        encode: t=>{
            const e = t
              , n = e.contributors
              , a = e.kills;
            let s = 0;
            s += 1,
            s += dynamicByteCounts.varuint(e.contrib, s),
            s += getVarUIntByteLength(n.length);
            for (let t = 0; t < n.length; t++) {
                const e = n[t];
                s += 1,
                s += 1,
                s += 1,
                s += dynamicByteCounts.string(e.name, s);
                const a = e.stats;
                s += getVarUIntByteLength(a.length);
                for (let t = 0; t < a.length; t++)
                    s += dynamicByteCounts.varuint(a[t], s)
            }
            s += dynamicByteCounts.varuint(e.duration, s),
            s += dynamicByteCounts.varuint(a[0], s),
            s += getVarUIntByteLength(a.length);
            for (let t = 1; t < a.length; t++)
                s += dynamicByteCounts.varuint(a[t], s);
            s += dynamicByteCounts.varuint(e.level, s),
            s += dynamicByteCounts.varuint(e.reward, s),
            s += 1;
            const r = new Uint8Array(s);
            offset = 0,
            writeUInt8(r, e._header),
            writeVarUInt(r, e.contrib),
            writeVarUInt(r, n.length);
            for (let t = 0; t < n.length; t++) {
                const e = n[t];
                writeUInt8(r, e.class),
                writeUInt8(r, e.faction),
                writeUInt8(r, e.level),
                writeString(r, e.name);
                const a = e.stats;
                writeVarUInt(r, a.length);
                for (let t = 0; t < a.length; t++)
                    writeVarUInt(r, a[t])
            }
            writeVarUInt(r, e.duration),
            writeVarUInt(r, a[0]),
            writeVarUInt(r, a.length);
            for (let t = 1; t < a.length; t++)
                writeVarUInt(r, a[t]);
            return writeVarUInt(r, e.level),
            writeVarUInt(r, e.reward),
            writeUInt8(r, e.status),
            r
        }
    },
    serverPartyPositions: {
        decode: t=>{
            const e = t
              , n = {};
            offset = 0,
            n._header = readUInt8(e),
            offset += 1;
            const a = [];
            n.members = a;
            const s = readVarUInt(e);
            for (let t = 0; t < s; t++) {
                const n = {};
                a[t] = n,
                n.entityid = readUInt16LE(e),
                offset += 2;
                const s = [];
                n.pos = s;
                const r = readVarUInt(e);
                for (let t = 0; t < r; t++)
                    s[t] = readUInt16LE(e),
                    offset += 2
            }
            return n
        }
        ,
        encode: t=>{
            const e = t
              , n = e.members;
            let a = 0;
            a += 1,
            a += getVarUIntByteLength(n.length);
            for (let t = 0; t < n.length; t++) {
                a += 2;
                const e = n[t].pos;
                a += getVarUIntByteLength(e.length);
                for (let t = 0; t < e.length; t++)
                    a += 2
            }
            const s = new Uint8Array(a);
            offset = 0,
            writeUInt8(s, e._header),
            writeVarUInt(s, n.length);
            for (let t = 0; t < n.length; t++) {
                const e = n[t];
                writeInt16LE(s, e.entityid);
                const a = e.pos;
                writeVarUInt(s, a.length);
                for (let t = 0; t < a.length; t++)
                    writeInt16LE(s, a[t])
            }
            return s
        }
    },
    serverChangeWorld: {
        decode: t=>{
            const e = t
              , n = {};
            return offset = 0,
            n._header = readUInt8(e),
            offset += 1,
            n.world = readString(e),
            n
        }
        ,
        encode: t=>{
            const e = t;
            let n = 0;
            n += 1,
            n += dynamicByteCounts.string(e.world, n);
            const a = new Uint8Array(n);
            return offset = 0,
            writeUInt8(a, e._header),
            writeString(a, e.world),
            a
        }
    },
    serverMapUpdate: {
        decode: t=>{
            const e = t
              , n = {};
            offset = 0,
            n._header = readUInt8(e),
            offset += 1;
            const a = [];
            n.icons = a;
            const s = readVarUInt(e);
            for (let t = 0; t < s; t++) {
                const n = {};
                a[t] = n,
                n.blink = !!readInt8(e),
                offset += 1,
                n.id = readUInt8(e),
                offset += 1;
                const s = [];
                n.pos = s,
                s[0] = readUInt16LE(e),
                offset += 2;
                const r = readVarUInt(e);
                for (let t = 1; t < r; t++)
                    s[t] = readUInt16LE(e),
                    offset += 2
            }
            return n
        }
        ,
        encode: t=>{
            const e = t
              , n = e.icons;
            let a = 0;
            a += 1,
            a += getVarUIntByteLength(n.length);
            for (let t = 0; t < n.length; t++) {
                a += 1,
                a += 1;
                const e = n[t].pos;
                a += 2,
                a += getVarUIntByteLength(e.length);
                for (let t = 1; t < e.length; t++)
                    a += 2
            }
            const s = new Uint8Array(a);
            offset = 0,
            writeUInt8(s, e._header),
            writeVarUInt(s, n.length);
            for (let t = 0; t < n.length; t++) {
                const e = n[t];
                writeInt8(s, e.blink ? 1 : 0),
                writeUInt8(s, e.id);
                const a = e.pos;
                writeInt16LE(s, a[0]),
                writeVarUInt(s, a.length);
                for (let t = 1; t < a.length; t++)
                    writeInt16LE(s, a[t])
            }
            return s
        }
    },
    serverChat: {
        decode: t=>{
            const e = t
              , n = {};
            offset = 0,
            n._header = readUInt8(e),
            offset += 1;
            const a = [];
            n.messages = a;
            const s = readVarUInt(e);
            for (let t = 0; t < s; t++) {
                const n = {};
                a[t] = n,
                n.channel = readString(e),
                n.clan = readString(e),
                n.class = readUInt8(e),
                offset += 1,
                n.faction = readUInt8(e),
                offset += 1,
                n.from = readString(e),
                n.id = readUInt32LE(e),
                offset += 4,
                n.level = readUInt8(e),
                offset += 1,
                n.message = readString(e),
                n.subscribed = readUInt8(e),
                offset += 1
            }
            return n
        }
        ,
        encode: t=>{
            const e = t
              , n = e.messages;
            let a = 0;
            a += 1,
            a += getVarUIntByteLength(n.length);
            for (let t = 0; t < n.length; t++) {
                const e = n[t];
                a += dynamicByteCounts.string(e.channel, a),
                a += dynamicByteCounts.string(e.clan, a),
                a += 1,
                a += 1,
                a += dynamicByteCounts.string(e.from, a),
                a += 4,
                a += 1,
                a += dynamicByteCounts.string(e.message, a),
                a += 1
            }
            const s = new Uint8Array(a);
            offset = 0,
            writeUInt8(s, e._header),
            writeVarUInt(s, n.length);
            for (let t = 0; t < n.length; t++) {
                const e = n[t];
                writeString(s, e.channel),
                writeString(s, e.clan),
                writeUInt8(s, e.class),
                writeUInt8(s, e.faction),
                writeString(s, e.from),
                writeUInt32LE(s, e.id),
                writeUInt8(s, e.level),
                writeString(s, e.message),
                writeUInt8(s, e.subscribed)
            }
            return s
        }
    },
    serverSystemMessage: {
        decode: t=>{
            const e = t
              , n = {};
            offset = 0,
            n._header = readUInt8(e),
            offset += 1;
            const a = [];
            n.messages = a;
            const s = readVarUInt(e);
            for (let t = 0; t < s; t++) {
                const n = {};
                a[t] = n,
                n.message = readString(e),
                n.type = readString(e)
            }
            return n
        }
        ,
        encode: t=>{
            const e = t
              , n = e.messages;
            let a = 0;
            a += 1,
            a += getVarUIntByteLength(n.length);
            for (let t = 0; t < n.length; t++) {
                const e = n[t];
                a += dynamicByteCounts.string(e.message, a),
                a += dynamicByteCounts.string(e.type, a)
            }
            const s = new Uint8Array(a);
            offset = 0,
            writeUInt8(s, e._header),
            writeVarUInt(s, n.length);
            for (let t = 0; t < n.length; t++) {
                const e = n[t];
                writeString(s, e.message),
                writeString(s, e.type)
            }
            return s
        }
    },
    ping: {
        decode: t=>{
            const e = t
              , n = {};
            return offset = 0,
            n._header = readUInt8(e),
            offset += 1,
            n.id = readUInt8(e),
            offset += 1,
            n
        }
        ,
        encode: t=>{
            const e = t;
            let n = 0;
            n += 1,
            n += 1;
            const a = new Uint8Array(n);
            return offset = 0,
            writeUInt8(a, e._header),
            writeUInt8(a, e.id),
            a
        }
    }
};
let header = 0;
for (const t in netSchemas)
    netSchemas[t] && (netSchemas[t].header = header++,
    netSchemas[t].packData = function(t) {
        return this.prepareData && this.prepareData(t),
        t._header = this.header,
        this.encode(t)
    }
    );
const rndArrayFixed = (t,e)=>t[Math.floor(e * t.length)]
  , playNonspatialSound = (t,e,n,a)=>{}
  , playUiSound = (t,e)=>{
    const n = playNonspatialSound();
    void 0 !== e && (n.gain.gain.value = e)
}
  , clamp = (t,e,n)=>Math.min(Math.max(t, e), n)
  , rotationV2 = t=>{
    let e = Math.atan2(t[0], t[1]);
    return e < 0 && (e += 2 * Math.PI),
    e
}
  , buttons = {}
  , mappings = {}
  , onMappingPress = function(t) {
    return this.press.push(t),
    t
}
  , onMappingRelease = function(t) {
    return this.release.push(t),
    t
}
  , addMapping = (t,e)=>(e.press || (e.down = !1,
e.onPress = onMappingPress,
e.onRelease = onMappingRelease,
e.press = [],
e.release = [],
e.mappings = [],
e.store || (e.store = writable(!1))),
(t = Array.isArray(t) ? t : [t]).forEach(t=>{
    mappings[t] = e,
    e.mappings.push(t)
}
),
buttons$1.set(buttons),
e);
drag.subscribe(t=>{}
);
const ui = {
    hammer: {
        sound: 119,
        rot: 1
    },
    bow: {
        sound: 120,
        rot: 1
    },
    staff: {
        sound: 120,
        rot: 1
    },
    sword: {
        sound: 119,
        rot: 1
    },
    armlet: {
        sound: 121
    },
    armor: {
        sound: 122
    },
    bag: {
        sound: 121
    },
    boot: {
        sound: 121
    },
    glove: {
        sound: 121
    },
    ring: {
        sound: 123
    },
    amulet: {
        sound: 123
    },
    quiver: {
        sound: 121,
        rot: 1
    },
    shield: {
        sound: 122
    },
    totem: {
        sound: 122,
        rot: 1
    },
    orb: {
        sound: 122
    },
    rune: {
        sound: 123,
        rot: 0
    },
    misc: {
        sound: 124,
        rot: 1
    },
    book: {
        sound: 121
    },
    mount: {
        sound: 121,
        rot: 0
    },
    pet: {
        sound: 121,
        rot: 0
    },
    box: {
        sound: 125,
        rot: 0
    },
    gold: {
        sound: 126
    },
    charm: {
        sound: 123
    }
}
  , types = {
    hammer: {
        baselvl: 0,
        slot: [101],
        tiers: 17,
        drop: .4,
        weight: 1,
        class: 3,
        stats: {
            10: {
                base: 1,
                min: .6,
                max: 1
            },
            11: {
                base: 3,
                min: .8,
                max: 1.7
            },
            17: {
                base: 15,
                min: .05,
                max: .1
            }
        }
    },
    bow: {
        baselvl: 0,
        slot: [101],
        tiers: 17,
        drop: .4,
        weight: 1,
        class: 2,
        stats: {
            10: {
                base: 1,
                min: .6,
                max: 1
            },
            11: {
                base: 3,
                min: .8,
                max: 1.7
            },
            17: {
                base: 10,
                min: .05,
                max: .1
            }
        }
    },
    staff: {
        baselvl: 0,
        slot: [101],
        tiers: 17,
        drop: .4,
        weight: 1,
        class: 1,
        stats: {
            10: {
                base: 1,
                min: .6,
                max: 1
            },
            11: {
                base: 3,
                min: .8,
                max: 1.7
            },
            17: {
                base: 10,
                min: .05,
                max: .1
            }
        }
    },
    sword: {
        baselvl: 0,
        slot: [101],
        tiers: 17,
        drop: .4,
        weight: 1,
        class: 0,
        stats: {
            10: {
                base: 1,
                min: .6,
                max: 1
            },
            11: {
                base: 3,
                min: .8,
                max: 1.7
            },
            17: {
                base: 20,
                min: .05,
                max: .1
            }
        }
    },
    armlet: {
        baselvl: 1,
        slot: [102],
        tiers: 13,
        drop: 1,
        weight: .3,
        stats: {
            6: {
                base: 10,
                min: .5,
                max: .9
            },
            12: {
                base: 7,
                min: .5,
                max: .8
            }
        }
    },
    armor: {
        baselvl: 2,
        slot: [103],
        tiers: 11,
        drop: 1,
        weight: 1,
        stats: {
            12: {
                base: 10,
                min: 1.4,
                max: 2.8
            },
            6: {
                base: 20,
                min: 1,
                max: 2
            }
        }
    },
    bag: {
        baselvl: 5,
        slot: [104],
        tiers: 5,
        drop: 1,
        weight: .1,
        stats: {
            19: {
                base: 1,
                min: .1,
                max: .3
            }
        }
    },
    boot: {
        baselvl: 2,
        slot: [105],
        tiers: 13,
        drop: 1,
        weight: .4,
        stats: {
            6: {
                base: 10,
                min: .6,
                max: 1
            },
            12: {
                base: 8,
                min: .6,
                max: 1.1
            },
            15: {
                base: 3,
                min: .03,
                max: .1
            }
        }
    },
    glove: {
        baselvl: 2,
        slot: [106],
        tiers: 13,
        drop: 1,
        weight: .4,
        stats: {
            6: {
                base: 10,
                min: .6,
                max: 1
            },
            12: {
                base: 8,
                min: .7,
                max: 1.1
            },
            14: {
                base: 1,
                min: .1,
                max: 1.5
            }
        }
    },
    ring: {
        baselvl: 5,
        slot: [107],
        tiers: 12,
        drop: .8,
        weight: .2,
        stats: {
            6: {
                base: 10,
                min: .5,
                max: .9
            },
            7: {
                base: 5,
                min: .6,
                max: 1
            }
        }
    },
    amulet: {
        baselvl: 7,
        slot: [108],
        tiers: 12,
        drop: .8,
        weight: .3,
        stats: {
            7: {
                base: 10,
                min: 1,
                max: 1.8
            },
            9: {
                base: 1,
                min: .2,
                max: .3
            }
        }
    },
    quiver: {
        baselvl: 2,
        slot: [109],
        tiers: 10,
        drop: .7,
        weight: .5,
        class: 2,
        stats: {
            14: {
                base: 5,
                min: .1,
                max: .9
            },
            9: {
                base: 1,
                min: .1,
                max: .3
            }
        }
    },
    shield: {
        baselvl: 2,
        slot: [109],
        tiers: 10,
        drop: .7,
        weight: .5,
        class: 0,
        stats: {
            12: {
                base: 20,
                min: .8,
                max: 1.4
            },
            13: {
                base: 4,
                min: 1,
                max: 2.8
            }
        }
    },
    totem: {
        baselvl: 2,
        slot: [109],
        tiers: 10,
        drop: .7,
        weight: .5,
        class: 3,
        stats: {
            12: {
                base: 10,
                min: .4,
                max: .9
            },
            9: {
                base: 1,
                min: .1,
                max: .4
            }
        }
    },
    orb: {
        baselvl: 2,
        slot: [109],
        tiers: 10,
        drop: .7,
        weight: .5,
        class: 1,
        stats: {
            3: {
                base: 10,
                min: .3,
                max: .7
            },
            9: {
                base: 1,
                min: .1,
                max: .3
            }
        }
    },
    rune: {
        baselvl: 1,
        tiers: 11,
        drop: .8,
        quality: 70
    },
    misc: {
        drop: 8,
        weight: .1
    },
    book: {
        drop: .9,
        weight: .5
    },
    charm: {
        slot: [110, 111],
        noupgrade: !0,
        undroppable: !0,
        drop: 0,
        stackable: !1
    },
    mount: {
        noupgrade: !0,
        undroppable: !0,
        drop: 0,
        stackable: !1
    },
    box: {
        noupgrade: !0,
        undroppable: !0,
        drop: 0,
        stackable: !1
    },
    pet: {
        noupgrade: !0,
        undroppable: !0,
        drop: 0,
        stackable: !1
    },
    gold: {
        drop: 20
    }
}
  , randomStats = {
    6: {
        min: .2,
        max: .8,
        round: !0
    },
    7: {
        min: .2,
        max: .5,
        round: !0
    },
    8: {
        min: .1,
        max: 1
    },
    9: {
        min: .1,
        max: .5
    },
    10: {
        min: .03,
        max: .13,
        round: !0
    },
    11: {
        min: .1,
        max: .2,
        round: !0
    },
    12: {
        min: .1,
        max: .8,
        round: !0
    },
    13: {
        min: .1,
        max: .4
    },
    14: {
        min: .1,
        max: .5
    },
    16: {
        min: .1,
        max: .4
    },
    2: {
        min: .08,
        max: .45,
        round: !0
    },
    0: {
        min: .08,
        max: .45,
        round: !0
    },
    3: {
        min: .08,
        max: .45,
        round: !0
    },
    4: {
        min: .08,
        max: .45,
        round: !0
    },
    1: {
        min: .08,
        max: .45,
        round: !0
    },
    5: {
        min: .08,
        max: .45,
        round: !0
    },
    18: {
        min: .01,
        max: .15,
        round: !0
    }
}
  , randomStatKeys = Object.keys(randomStats)
  , upgradeGains = {
    6: 4,
    7: 3,
    8: 5,
    9: 4,
    10: 1,
    11: 1,
    12: 5,
    13: 5,
    14: 5,
    15: .3,
    16: 5,
    17: 0,
    2: 2,
    0: 2,
    3: 2,
    4: 2,
    1: 2,
    5: 2,
    19: 1,
    18: 3
};
function create_if_block_4$2(t) {
    let e, n;
    return {
        c() {
            e = element("span"),
            n = text(t[2]),
            attr(e, "class", "slottext key")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p(t, e) {
            4 & e[0] && set_data(n, t[2])
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_3$2(t) {
    let e, n;
    return {
        c() {
            e = element("span"),
            n = text(t[3]),
            attr(e, "class", "slottext stacks")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p(t, e) {
            8 & e[0] && set_data(n, t[3])
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_2$2(t) {
    let e, n, a = (t[5] > 99 ? Math.round(t[5] / 60) + "'" : t[5] <= 3 ? t[5].toFixed(1) : Math.ceil(t[5])) + "";
    return {
        c() {
            e = element("div"),
            n = text(a),
            attr(e, "class", "time absCentered slottext svelte-18ojcpo")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p(t, e) {
            32 & e[0] && a !== (a = (t[5] > 99 ? Math.round(t[5] / 60) + "'" : t[5] <= 3 ? t[5].toFixed(1) : Math.ceil(t[5])) + "") && set_data(n, a)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_1$3(t) {
    let e;
    return {
        c() {
            e = element("div"),
            attr(e, "class", "autocast svelte-18ojcpo")
        },
        m(t, n) {
            insert(t, e, n)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block$3(t) {
    let e, n, a;
    const s = t[30].default
      , r = create_slot(s, t, t[29], null);
    return {
        c() {
            e = element("div"),
            r && r.c(),
            attr(e, "class", n = "border " + t[6] + " slotdescription svelte-18ojcpo"),
            attr(e, "style", t[10])
        },
        m(n, s) {
            insert(n, e, s),
            r && r.m(e, null),
            t[32](e),
            a = !0
        },
        p(t, i) {
            r && r.p && 536870912 & i[0] && update_slot(r, s, t, t[29], i, null, null),
            (!a || 64 & i[0] && n !== (n = "border " + t[6] + " slotdescription svelte-18ojcpo")) && attr(e, "class", n),
            (!a || 1024 & i[0]) && attr(e, "style", t[10])
        },
        i(t) {
            a || (transition_in(r, t),
            a = !0)
        },
        o(t) {
            transition_out(r, t),
            a = !1
        },
        d(n) {
            n && detach(e),
            r && r.d(n),
            t[32](null)
        }
    }
}
function create_fragment$6(t) {
    let e, n, a, s, r, i, o, l, c, d, p, u, m, f, g, h, _ = void 0 !== t[2] && create_if_block_4$2(t), b = void 0 !== t[3] && create_if_block_3$2(t), k = current.cdTextSkills && void 0 !== t[5] && create_if_block_2$2(t), y = t[11] && create_if_block_1$3(), v = t[9] && t[0] && !t[16] && create_if_block$3(t);
    return {
        c() {
            e = element("div"),
            _ && _.c(),
            n = empty(),
            b && b.c(),
            a = empty(),
            k && k.c(),
            s = element("div"),
            i = element("div"),
            l = element("div"),
            y && y.c(),
            d = element("img"),
            v && v.c(),
            attr(s, "class", r = "overlay " + (void 0 !== t[4] ? "" : "hidden") + " svelte-18ojcpo"),
            attr(i, "class", o = "overlay " + t[17] + " svelte-18ojcpo"),
            attr(l, "class", c = "overlay " + (!t[14] || t[4] > 0 && t[4] < 10 ? "hidden" : "offCd") + " svelte-18ojcpo"),
            attr(d, "class", p = "icon " + t[7] + " svelte-18ojcpo"),
            d.src !== (u = t[15]) && attr(d, "src", u),
            attr(e, "id", t[8]),
            attr(e, "class", m = "border " + t[6] + " " + (t[16] && t[16].data == t[1] ? "grey" : "") + " slot " + (t[1] ? "filled" : "") + " svelte-18ojcpo")
        },
        m(r, o) {
            insert(r, e, o),
            _ && _.m(e, null),
            append(e, n),
            b && b.m(e, null),
            append(e, a),
            k && k.m(e, null),
            append(e, s),
            t[31](s),
            append(e, i),
            append(e, l),
            y && y.m(e, null),
            append(e, d),
            v && v.m(e, null),
            f = !0,
            g || (h = [listen(e, "pointerenter", t[20]), listen(e, "pointerleave", t[21]), listen(e, "pointerdown", t[18]), listen(e, "pointerup", t[19])],
            g = !0)
        },
        p(t, g) {
            void 0 !== t[2] ? _ ? _.p(t, g) : (_ = create_if_block_4$2(t),
            _.c(),
            _.m(e, n)) : _ && (_.d(1),
            _ = null),
            void 0 !== t[3] ? b ? b.p(t, g) : (b = create_if_block_3$2(t),
            b.c(),
            b.m(e, a)) : b && (b.d(1),
            b = null),
            current.cdTextSkills && void 0 !== t[5] ? k ? k.p(t, g) : (k = create_if_block_2$2(t),
            k.c(),
            k.m(e, s)) : k && (k.d(1),
            k = null),
            (!f || 16 & g[0] && r !== (r = "overlay " + (void 0 !== t[4] ? "" : "hidden") + " svelte-18ojcpo")) && attr(s, "class", r),
            (!f || 131072 & g[0] && o !== (o = "overlay " + t[17] + " svelte-18ojcpo")) && attr(i, "class", o),
            (!f || 16400 & g[0] && c !== (c = "overlay " + (!t[14] || t[4] > 0 && t[4] < 10 ? "hidden" : "offCd") + " svelte-18ojcpo")) && attr(l, "class", c),
            t[11] ? y || (y = create_if_block_1$3(),
            y.c(),
            y.m(e, d)) : y && (y.d(1),
            y = null),
            (!f || 128 & g[0] && p !== (p = "icon " + t[7] + " svelte-18ojcpo")) && attr(d, "class", p),
            (!f || 32768 & g[0] && d.src !== (u = t[15])) && attr(d, "src", u),
            t[9] && t[0] && !t[16] ? v ? (v.p(t, g),
            66049 & g[0] && transition_in(v, 1)) : (v = create_if_block$3(t),
            v.c(),
            transition_in(v, 1),
            v.m(e, null)) : v && (group_outros(),
            transition_out(v, 1, 1, ()=>{
                v = null
            }
            ),
            check_outros()),
            (!f || 256 & g[0]) && attr(e, "id", t[8]),
            (!f || 65602 & g[0] && m !== (m = "border " + t[6] + " " + (t[16] && t[16].data == t[1] ? "grey" : "") + " slot " + (t[1] ? "filled" : "") + " svelte-18ojcpo")) && attr(e, "class", m)
        },
        i(t) {
            f || (transition_in(v),
            f = !0)
        },
        o(t) {
            transition_out(v),
            f = !1
        },
        d(n) {
            n && detach(e),
            _ && _.d(),
            b && b.d(),
            k && k.d(),
            t[31](null),
            y && y.d(),
            v && v.d(),
            g = !1,
            run_all(h)
        }
    }
}
function instance$6(t, e, n) {
    let a;
    component_subscribe(t, drag, t=>n(16, a = t));
    let {data: s} = e
      , {key: r} = e
      , {stacks: i} = e
      , {cd: o} = e
      , {remaining: l} = e
      , {border: c="grey"} = e
      , {img: d} = e
      , {meta: p} = e
      , {css: u=""} = e
      , {id: m=""} = e
      , {describe: f=!0} = e
      , {queued: g=!1} = e
      , {pickable: h=!0} = e
      , {descRoot: _} = e
      , {descPos: b="bottom: 100%; right: 100%;"} = e
      , {auto: k=!1} = e
      , {status: y=0} = e
      , {hover: v=!1} = e
      , {clickToUse: x=!1} = e
      , w = !1;
    const S = (t,e)=>t ? "queued" : 5 == e ? "oom" : 6 == e ? "range" : 11 == e || 9 == e ? "combat" : "hidden";
    let$;
    const I = t=>{
        !x || buttons.shift.down || buttons.ctrl.down ? (w = !0,
        U(!1),
        E("click", p)) : E("use", {
            e: t,
            ...p
        })
    }
      , C = t=>{
        2 == t.button ? buttons.shift.down || buttons.ctrl.down ? E("use", {
            e: t,
            ...p
        }) : E("context", {
            e: t,
            ...p
        }) : a ? (a.data.type && playUiSound(ui[a.data.type].sound),
        E("move", {
            from: a.meta,
            to: p
        }),
        a.meta && a.meta.store && a.meta.store.set(),
        set_store_value(drag, a = void 0)) : (!x || buttons.shift.down || buttons.ctrl.down) && D(),
        w = !1
    }
      , L = t=>{
        U(!0)
    }
      , B = ()=>{
        E("discard")
    }
      , M = t=>{
        U(!1),
        s && w && (w = !1,
        D())
    }
      , U = t=>{
        "force" !== v && n(0, v = t)
    }
      , D = ()=>{
        s && !1 !== h && (s.moving || set_store_value(drag, a = {
            data: s,
            img: d,
            meta: p,
            border: c,
            css: u,
            discard: B
        }),
        s.type && playUiSound(ui[s.type].sound))
    }
      , E = createEventDispatcher();
    let O, V, A, P, {$$slots: F={}, $$scope: q} = e;
    function H(t) {
        binding_callbacks[t ? "unshift" : "push"](()=>{
            O = t,
            n(13, O)
        }
        )
    }
    function R(t) {
        binding_callbacks[t ? "unshift" : "push"](()=>{
            $ = t,
            n(12, $)
        }
        )
    }
    return t.$$set = t=>{
        "data"in t && n(1, s = t.data),
        "key"in t && n(2, r = t.key),
        "stacks"in t && n(3, i = t.stacks),
        "cd"in t && n(4, o = t.cd),
        "remaining"in t && n(5, l = t.remaining),
        "border"in t && n(6, c = t.border),
        "img"in t && n(22, d = t.img),
        "meta"in t && n(23, p = t.meta),
        "css"in t && n(7, u = t.css),
        "id"in t && n(8, m = t.id),
        "describe"in t && n(9, f = t.describe),
        "queued"in t && n(24, g = t.queued),
        "pickable"in t && n(25, h = t.pickable),
        "descRoot"in t && n(26, _ = t.descRoot),
        "descPos"in t && n(10, b = t.descPos),
        "auto"in t && n(11, k = t.auto),
        "status"in t && n(27, y = t.status),
        "hover"in t && n(0, v = t.hover),
        "clickToUse"in t && n(28, x = t.clickToUse),
        "$$scope"in t && n(29, q = t.$$scope)
    }
    ,
    t.$$.update = ()=>{
        16400 & t.$$.dirty[0] && n(14, V = V || o > 0),
        138477585 & t.$$.dirty[0] && n(15, A = d ? a && v || o > 0 || -1 == y ? d.replace(".", "_grey.").replace(/_q[0-9]/g, "") : d : `/assets/ui/slotbg/bg.${imgFlat}?v=5700123`),
        150996992 & t.$$.dirty[0] && n(17, P = S(k || g, y)),
        67112960 & t.$$.dirty[0] && $ && _ && _.appendChild($),
        t.$$.dirty[0]
    }
    ,
    [v, s, r, i, o, l, c, u, m, f, b, k, $, O, V, A, a, P, I, C, L, M, d, p, g, h, _, y, x, q, F, H, R]
}
class Slot extends SvelteComponent {
    constructor(t) {
        super(),
        init(this, t, instance$6, create_fragment$6, not_equal, {
            data: 1,
            key: 2,
            stacks: 3,
            cd: 4,
            remaining: 5,
            border: 6,
            img: 22,
            meta: 23,
            css: 7,
            id: 8,
            describe: 9,
            queued: 24,
            pickable: 25,
            descRoot: 26,
            descPos: 10,
            auto: 11,
            status: 27,
            hover: 0,
            clickToUse: 28
        }, [-1, -1])
    }
}
const goldSplit = t=>{
    const e = (t || 0).toString().split("");
    return {
        c: e.splice(-2).join(""),
        s: e.splice(-2).join(""),
        g: e.join("")
    }
}
  , goldRaw = (t,e=!1)=>{
    const {c: n, s: a, g: s} = goldSplit(t);
    let r = "<span/>";
    return "" != s && (r += `<span class=${e ? "textred" : "textgold"}>${s}</span> <img class=texticon src='/assets/ui/currency/gold.${imgAlpha}?v=5700123'/>`),
    "" != a && (r += `<span class=${e ? "textred" : "textsilver"}>${a}</span> <img class=texticon src='/assets/ui/currency/silver.${imgAlpha}?v=5700123'/>`),
    "" != n && (r += `<span class=${e ? "textred" : "textcopper"}>${n}</span> <img class=texticon src='/assets/ui/currency/copper.${imgAlpha}?v=5700123'/>`),
    r + "</span>"
}
  , medalsRaw = (t,e=!1)=>`<span class='${e ? "textred" : "textgold"}'><img class='svgicon' src='${medal}'> ${longnum(t)}</span>`;
function create_fragment$5(t) {
    let e;
    return {
        c() {
            e = element("span")
        },
        m(n, a) {
            insert(n, e, a),
            e.innerHTML = t[0]
        },
        p(t, [n]) {
            1 & n && (e.innerHTML = t[0])
        },
        i: noop,
        o: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function instance$5(t, e, n) {
    let a;
    component_subscribe(t, inventoryGold, t=>n(4, a = t));
    let s, r, {amount: i} = e, {isPrice: o=!1} = e;
    return t.$$set = t=>{
        "amount"in t && n(1, i = t.amount),
        "isPrice"in t && n(2, o = t.isPrice)
    }
    ,
    t.$$.update = ()=>{
        22 & t.$$.dirty && n(3, s = o && i > a),
        10 & t.$$.dirty && n(0, r = goldRaw(i, s))
    }
    ,
    [r, i, o]
}
class Gold extends SvelteComponent {
    constructor(t) {
        super(),
        init(this, t, instance$5, create_fragment$5, not_equal, {
            amount: 1,
            isPrice: 2
        })
    }
}
function create_fragment$4(t) {
    let e;
    return {
        c() {
            e = element("span")
        },
        m(n, a) {
            insert(n, e, a),
            e.innerHTML = t[0]
        },
        p(t, [n]) {
            1 & n && (e.innerHTML = t[0])
        },
        i: noop,
        o: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function instance$4(t, e, n) {
    let a;
    component_subscribe(t, inventoryMedals, t=>n(4, a = t));
    let s, r, {amount: i} = e, {isPrice: o=!1} = e;
    return t.$$set = t=>{
        "amount"in t && n(1, i = t.amount),
        "isPrice"in t && n(2, o = t.isPrice)
    }
    ,
    t.$$.update = ()=>{
        22 & t.$$.dirty && n(3, s = o && i > a),
        10 & t.$$.dirty && n(0, r = medalsRaw(i, s))
    }
    ,
    [r, i, o]
}
class Medals extends SvelteComponent {
    constructor(t) {
        super(),
        init(this, t, instance$4, create_fragment$4, not_equal, {
            amount: 1,
            isPrice: 2
        })
    }
}
const funval = (t,e)=>"function" == typeof t ? t(e) : t
  , miscStats = Object.keys({
    onBlock: 0,
    statsStatic: 0,
    statsConvert: 0,
    statsOverride: 0,
    onInterval: 0,
    multiplyIncomingHeal: 0,
    multiplyIncomingDamage: 0,
    addIncomingHeal: 0,
    addIncomingDamage: 0,
    addIncomingCrit: 0,
    afterDamageEnemy: 0,
    afterHealAlly: 0,
    beforeDamageEnemy: 0,
    beforeIncomingDamage: 0,
    afterIncomingDamage: 0,
    movementOverride: 0,
    incapacitated: 0,
    breakOnMove: 0,
    breakOnCast: 0,
    instantCast: 0,
    onCast: 0,
    onEnd: 0,
    onAffectedEnemyDeath: 0,
    immuneAll: 0,
    immuneCC: 0,
    breakAfterPercentDamage: 0
});
class BuffLogic {
    constructor(t) {
        this.id = t.id,
        this.intervalHaste = !1 !== t.intervalHaste,
        this.intervalDuration = t.intervalDuration,
        this.intervalOnApply = t.intervalOnApply || !1,
        this.maxStacks = t.maxStacks,
        this.passive = t.passive || !1,
        this.clearOnDeath = !1 !== t.clearOnDeath,
        this.custom = t.custom,
        this.unique = t.unique || !1,
        this.dr = t.dr || 0,
        this.type = t.type || 0,
        this.tags = t.tags || new Set,
        this.immuneAll = t.immuneAll || !1,
        this.immuneCC = t.immuneCC || !1,
        miscStats.forEach(e=>{
            this[e] = t[e]
        }
        ),
        this.icon = t.icon,
        this.fx = t.fx || {}
    }
    onSet(t, e, n) {
        this.tags.forEach(e=>{
            n.tags.get(e).add(t)
        }
        ),
        miscStats.forEach(e=>{
            this[e] && ("incapacitated" !== e && "movementOverride" !== e || n.immuneCC.size <= 0) && n[e].add(t)
        }
        )
    }
    onRemove(t, e, n) {
        this.tags.forEach(e=>{
            n.tags.get(e).delete(t)
        }
        ),
        miscStats.forEach(e=>{
            this[e] && n[e].delete(t)
        }
        )
    }
}
const armorreinforcementBuff = new BuffLogic({
    id: 76,
    passive: !0,
    statsStatic: (t,e)=>{
        e.addStat(12, Math.round(40 * t.level)),
        e.addStat(28, Math.round(200 * t.level))
    }
})
  , blockBuff$1 = new BuffLogic({
    id: 58,
    icon: "skills/2",
    fx: {
        stick: 15
    },
    statsStatic: (t,e)=>{
        e.addStat(13, 300 + 40 * t.level)
    }
})
  , unpack2f32 = (t,e)=>{
    const n = e / 65535;
    return [(t >>> 16) * n, (65535 & t) * n]
}
  , moveTowardsBuffdata = (t,e)=>{
    if (t.static || !e.data)
        return !1;
    const n = unpack2f32(2 * e.data[0], 6400)
      , a = [n[0] - t.pos[0], n[1] - t.pos[2]];
    return length(a) > t.size ? (t.setSteer(0, 1),
    t.setRot(rotationV2(a)),
    t.setJump(0),
    !0) : (t.setSteer(0, 0),
    !1)
}
  , chargeBuff = new BuffLogic({
    id: 86,
    incapacitated: !0,
    icon: "skills/33",
    fx: {
        stick: 74,
        endSound: 65
    },
    statsOverride: (t,e)=>{
        e.stat.set(15, 250)
    }
    ,
    movementOverride: (t,e,n,a,s)=>{
        moveTowardsBuffdata(a, s) || a.buffs.removeBuff(s.id, a.id)
    }
})
  , courageBuff = new BuffLogic({
    id: 75,
    icon: "skills/20",
    fx: {
        stick: 53
    },
    unique: !0,
    statsStatic: (t,e)=>{
        e.addStat(12, Math.round(30 * t.level)),
        e.addStat(9, Math.round(22 * t.level))
    }
})
  , crescentBleedBuff = new BuffLogic({
    id: 72,
    passive: !0,
    icon: "skills/17",
    custom: [[t=>93 + 32 * t, "% as additional damage over 10 seconds"]],
    afterDamageEnemy: {
        3: (t,e,n)=>{}
    }
})
  , crescentBleedDebuff = new BuffLogic({
    id: 73,
    type: 1,
    tags: new Set([1]),
    maxStacks: 3,
    icon: "skills/18",
    fx: {
        stick: 38,
        color: [.7, .1, .1, .5]
    },
    intervalDuration: 1.5,
    onInterval: (t,e,n)=>({
        id: 18,
        mode: 1,
        caster: t.caster,
        target: e.id,
        dmg: t.level * t.stacks,
        noDaze: !0,
        type: 1
    })
})
  , enrageBuff = new BuffLogic({
    id: 71,
    icon: "skills/17",
    fx: {
        stick: 18,
        color: [.9, .3, .1, .7]
    },
    custom: [[t=>12 * t, "% increased damage"]]
})
  , relentlessCryDebuff = new BuffLogic({
    id: 121,
    incapacitated: !0,
    type: 1,
    tags: new Set([7]),
    dr: 3,
    breakAfterPercentDamage: .1,
    icon: "skills/50",
    fx: {
        stick: 86,
        incapacitated: !0
    },
    statsOverride: (t,e)=>{
        e.stat.get(15) > 100 && e.stat.set(15, 100)
    }
    ,
    movementOverride: (t,e,n,a,s)=>{
        moveTowardsBuffdata(a, s)
    }
    ,
    intervalDuration: 1
})
  , specializationWarrior = new BuffLogic({
    id: 60,
    passive: !0,
    icon: "skills/8",
    statsConvert: [[0, .3, 10], [0, .3, 11], [0, .3, 8]]
})
  , tauntDebuff = new BuffLogic({
    id: 88,
    type: 1,
    tags: new Set([3]),
    icon: "skills/34",
    statsStatic: (t,e)=>{
        e.maxStat(29, 10 + 10 * t.level)
    }
})
  , temperBoostBuff = new BuffLogic({
    id: 105,
    maxStacks: 3,
    icon: "skills/temperBoostBuff",
    fx: {
        stick: 24,
        color: [.2, .2, .25, .95]
    },
    statsStatic: (t,e)=>{
        e.addStat(15, 20)
    }
})
  , temperBuff = new BuffLogic({
    id: 104,
    maxStacks: 3,
    tags: new Set([3, 4]),
    icon: "skills/41",
    fx: {
        stick: 23,
        color: [.1, .1, .1, .92]
    },
    intervalDuration: .5,
    onInterval: (t,e,n)=>!0
})
  , warcryBuff = new BuffLogic({
    id: 74,
    icon: "skills/19",
    fx: {
        stick: 54
    },
    unique: !0,
    statsStatic: (t,e)=>{
        e.addStat(10, 3 * t.level),
        e.addStat(11, 4 * t.level),
        e.addStat(6, 50 * t.level)
    }
})
  , whirlwindChannel = new BuffLogic({
    id: 115,
    incapacitated: !0,
    tags: new Set([8]),
    immuneCC: !0,
    icon: "skills/46",
    fx: {
        anim: 34
    },
    statsStatic: (t,e)=>{
        e.maxStat(29, 40)
    }
    ,
    statsOverride: (t,e)=>{
        e.stat.set(13, 0)
    }
    ,
    intervalDuration: .5,
    onInterval: (t,e,n)=>!0
})
  , agonizeDebuff = new BuffLogic({
    id: 90,
    type: 1,
    tags: new Set([6]),
    incapacitated: !0,
    dr: 3,
    icon: "skills/37",
    fx: {
        visual: 20,
        stick: 88,
        endSound: 69
    },
    statsStatic: (t,e)=>{
        e.maxStat(29, 30 + 7 * t.level),
        e.maxStat(30, 20 + 5 * t.level)
    }
})
  , caninehowlBuff = new BuffLogic({
    id: 83,
    icon: "skills/28",
    fx: {
        stick: 65
    },
    unique: !0,
    statsStatic: (t,e)=>{
        e.addStat(16, 100 + 60 * t.level)
    }
})
  , decayBuff = new BuffLogic({
    id: 66,
    type: 1,
    tags: new Set([3, 1]),
    icon: "skills/12",
    fx: {
        apply: 50,
        stick: 49,
        color: [.5, .4, .05, .5]
    },
    statsStatic: (t,e)=>{
        e.maxStat(29, 20 + 3 * t.level)
    }
    ,
    intervalDuration: 1.5,
    onInterval: (t,e,n)=>({
        id: 12,
        mode: 1,
        caster: t.caster,
        target: e.id,
        dmg: 1 + n.stats.getDamageRoll() * (.1 + .08 * t.level),
        type: 1,
        noDaze: !0
    })
})
  , manaBuff = new BuffLogic({
    id: 67,
    icon: "skills/13",
    fx: {
        stick: 52
    },
    intervalDuration: 1,
    custom: [[t=>30 + 40 * t, "MP recovered"]],
    onInterval: (t,e,n)=>{}
})
  , plaguespreaderBuff = new BuffLogic({
    id: 107,
    maxStacks: 5,
    icon: "skills/43",
    fx: {
        stick: 20
    }
})
  , plaguespreaderBuffPassive = new BuffLogic({
    id: 106,
    passive: !0
})
  , revitalizeBuff = new BuffLogic({
    id: 59,
    maxStacks: 3,
    icon: "skills/7",
    fx: {
        stick: 37
    },
    intervalDuration: 1,
    multiplyIncomingHeal: {
        6: t=>1 + .3 * t.stacks,
        7: t=>1 + .3 * (t.stacks - 1)
    },
    onInterval: (t,e,n)=>({
        id: 7,
        mode: 2,
        caster: t.caster,
        target: e.id,
        heal: 6 + n.stats.getDamageRoll() * (.028 + .024 * t.level)
    })
})
  , specializationShaman = new BuffLogic({
    id: 63,
    passive: !0,
    icon: "skills/8",
    statsConvert: [[4, .4, 10], [4, .4, 11]]
})
  , spiritanimalBuff = new BuffLogic({
    id: 89,
    breakOnCast: !0,
    icon: "skills/36",
    fx: {
        visual: 26,
        apply: 76,
        endSound: 69
    },
    statsStatic: (t,e)=>{
        e.addStat(15, 8 + 12 * t.level)
    }
})
  , blindingShotDebuff = new BuffLogic({
    id: 119,
    incapacitated: !0,
    type: 1,
    tags: new Set([7]),
    dr: 3,
    breakAfterPercentDamage: .1,
    icon: "skills/49",
    fx: {
        incapacitated: !0,
        apply: 122,
        stick: 124
    },
    statsOverride: (t,e)=>{
        e.stat.get(15) > 50 && e.stat.set(15, 50)
    }
    ,
    movementOverride: (t,e,n,a,s)=>{
        moveTowardsBuffdata(a, s)
    }
})
  , boneArrowBuff = new BuffLogic({
    id: 120,
    passive: !0
})
  , cranialpuncturesBuff = new BuffLogic({
    id: 81,
    passive: !0,
    statsStatic: (t,e)=>{
        e.addStat(14, Math.round(30 * t.level))
    }
})
  , invigorateBuff = new BuffLogic({
    id: 65,
    icon: "skills/11",
    fx: {
        stick: 39,
        endSound: 69
    },
    custom: [[t=>9 * t, "% increased damage"]]
})
  , pathfindingBuff = new BuffLogic({
    id: 82,
    icon: "skills/27",
    fx: {
        stick: 63
    },
    unique: !0,
    statsStatic: (t,e)=>{
        e.addStat(15, 5 + 13 * t.level)
    }
})
  , poisonarrowsBuff = new BuffLogic({
    id: 84,
    passive: !0,
    icon: "skills/29",
    custom: [[t=>5 + 25 * t, "% per stack as additional damage over 10 seconds"]],
    afterDamageEnemy: {
        9: (t,e,n)=>{}
    }
})
  , poisonarrowsDebuff = new BuffLogic({
    id: 85,
    type: 1,
    maxStacks: 3,
    tags: new Set([3, 1]),
    icon: "skills/29",
    fx: {
        apply: 51,
        stick: 66,
        color: [.1, 1, .3, .3]
    },
    statsStatic: (t,e)=>{
        e.maxStat(29, 30)
    }
    ,
    intervalDuration: 1.5,
    onInterval: (t,e,n)=>({
        id: 29,
        mode: 1,
        caster: t.caster,
        target: e.id,
        dmg: t.level * t.stacks,
        type: 1,
        noDaze: !0
    })
})
  , preciseshotBuff = new BuffLogic({
    id: 95,
    maxStacks: 4,
    icon: "skills/31",
    instantCast: new Set([31]),
    beforeDamageEnemy: {
        31: (t,e,n,a)=>{}
    }
})
  , serpentArrowsBuff = new BuffLogic({
    id: 64,
    passive: !0,
    icon: "skills/10",
    custom: [[t=>2 + 1 * t, " Jumps"], [t=>15 + 12.5 * t, "% damage per Jump"]],
    afterDamageEnemy: {
        9: (t,e,n)=>{}
    }
})
  , snipeBuff = new BuffLogic({
    id: 91,
    icon: "skills/38",
    fx: {
        stick: 77
    },
    statsStatic: (t,e)=>{
        e.addStat(15, 30)
    }
    ,
    instantCast: new Set([9]),
    onCast: {
        9: (t,e)=>{}
    }
})
  , snipeMoveBuff = new BuffLogic({
    id: 96,
    passive: !1,
    incapacitated: !0,
    icon: "skills/38",
    statsOverride: (t,e)=>{
        e.stat.set(15, 400)
    }
    ,
    movementOverride: (t,e,n,a,s)=>{
        a.setSteer(s.data[0] - 1, s.data[1] - 1)
    }
})
  , specializationArcher = new BuffLogic({
    id: 62,
    passive: !0,
    icon: "skills/8",
    statsConvert: [[2, .4, 10], [2, .4, 11]]
})
  , temporaldilationBuff = new BuffLogic({
    id: 80,
    icon: "skills/25",
    fx: {
        stick: 64
    },
    unique: !0,
    statsStatic: (t,e)=>{
        e.addStat(16, 30 * t.level)
    }
})
  , vampiricArrowBuff = new BuffLogic({
    id: 118,
    passive: !0
})
  , volleyChannel = new BuffLogic({
    id: 114,
    incapacitated: !0,
    tags: new Set([8]),
    icon: "skills/45",
    fx: {
        anim: 33
    },
    intervalDuration: .2,
    statsStatic: (t,e)=>{
        e.maxStat(29, 15)
    }
    ,
    onInterval: (t,e,n)=>!0
})
  , arcticauraBuff = new BuffLogic({
    id: 77,
    icon: "skills/22",
    fx: {
        stick: 60
    },
    unique: !0,
    statsStatic: (t,e)=>{
        e.addStat(14, 30 * t.level)
    }
})
  , deepFrozenBuff = new BuffLogic({
    id: 101,
    type: 1,
    tags: new Set([5]),
    incapacitated: !0,
    dr: 1,
    icon: "skills/deepFrozen",
    fx: {
        stick: 57,
        color: [.1, .9, .8, .9],
        frozen: !0
    },
    statsStatic: (t,e)=>{
        e.maxStat(29, 100)
    }
    ,
    multiplyIncomingDamage: {
        4: t=>1 + .1 * t.level,
        15: t=>1 + .1 * t.level,
        51: t=>1 + .1 * t.level
    }
})
  , enchantmentBuff = new BuffLogic({
    id: 79,
    icon: "skills/24",
    fx: {
        stick: 91
    },
    unique: !0,
    statsStatic: (t,e)=>{
        e.addStat(10, Math.floor(2 + 1.5 * t.level)),
        e.addStat(11, Math.floor(3 + 3.5 * t.level))
    }
})
  , extraboltBuff = new BuffLogic({
    id: 108,
    icon: "skills/extraBolt",
    fx: {
        stick: 22
    }
})
  , frostcallChannel = new BuffLogic({
    id: 116,
    incapacitated: !0,
    tags: new Set([8]),
    breakOnMove: !0,
    icon: "skills/52",
    fx: {
        anim: 35
    },
    intervalDuration: 1,
    intervalOnApply: 1,
    onInterval: (t,e,n)=>!0
})
  , frostnovaBuff = new BuffLogic({
    id: 68,
    type: 1,
    tags: new Set([4]),
    dr: 2,
    icon: "skills/14",
    fx: {
        stick: 56,
        color: [.7, .7, 1, .4]
    },
    statsStatic: (t,e)=>{
        e.maxStat(29, 100)
    }
    ,
    addIncomingCrit: {
        4: t=>10 + 30 * t.level,
        15: t=>20 + 30 * t.level
    },
    intervalDuration: 1.5,
    onInterval: (t,e,n)=>({
        id: 14,
        mode: 1,
        caster: t.caster,
        target: e.id,
        dmg: n.stats.getDamageRoll() * (.1 + .3 * t.level),
        type: 1,
        noDaze: !0
    })
})
  , frozenBuff = new BuffLogic({
    id: 99,
    type: 1,
    tags: new Set([3]),
    maxStacks: 4,
    icon: "skills/frozenBuff",
    fx: {
        stick: 58,
        color: [.1, .1, .8, .5]
    },
    statsStatic: (t,e)=>{
        e.maxStat(29, 20)
    }
})
  , hypothermicBuff = new BuffLogic({
    id: 70,
    icon: "skills/16",
    fx: {
        stick: 40,
        endSound: 69
    },
    statsStatic: (t,e)=>{
        e.addStat(16, 30 + 70 * t.level),
        e.addStat(27, 2 + 8 * t.level)
    }
})
  , iceBlockBuff = new BuffLogic({
    id: 117,
    incapacitated: !0,
    tags: new Set([9]),
    immuneAll: !0,
    intervalDuration: 1,
    intervalHaste: !1,
    icon: "skills/53",
    fx: {
        stick: 120,
        frozen: !0
    },
    statsStatic: (t,e)=>{
        e.maxStat(29, 100)
    }
    ,
    onInterval: (t,e,n)=>({
        id: 53,
        mode: 2,
        caster: t.caster,
        target: n.id,
        heal: 50 * t.level,
        nocrit: !0
    })
})
  , iceboltBuff = new BuffLogic({
    id: 100,
    passive: !0
})
  , iceshieldBuff = new BuffLogic({
    id: 78,
    icon: "skills/23",
    fx: {
        stick: 17
    }
})
  , icicleBuff = new BuffLogic({
    id: 69,
    passive: !0
})
  , specializationMage = new BuffLogic({
    id: 61,
    passive: !0,
    icon: "skills/8",
    statsConvert: [[3, .4, 10], [3, .4, 11]]
})
  , blueMarble = new BuffLogic({
    id: 112,
    type: 0,
    icon: "skills/charm4",
    fx: {
        stick: 42,
        color: [0, 0, 1, .7]
    }
})
  , boss_flamepitDebuff = new BuffLogic({
    id: 113,
    type: 1,
    tags: new Set([1]),
    maxStacks: 10,
    icon: "skills/firebuff",
    fx: {
        stick: 67,
        color: [2, 1, .3, 1]
    }
})
  , boss_puddledotDebuff = new BuffLogic({
    id: 124,
    type: 1,
    tags: new Set([1]),
    maxStacks: 5,
    icon: "skills/firebuff",
    fx: {
        stick: 132,
        apply: 135,
        color: [.7, .1, 1.5, 1]
    }
})
  , daze = new BuffLogic({
    id: 93,
    type: 1,
    tags: new Set([3]),
    icon: "skills/dazedBuff",
    fx: {
        stick: 73
    },
    statsStatic: (t,e)=>{
        e.maxStat(29, 30)
    }
})
  , dmgBoost = new BuffLogic({
    id: 110,
    type: 0,
    icon: "skills/charm2",
    fx: {
        stick: 21,
        color: [1, 0, 0, .8]
    },
    statsStatic: (t,e)=>{
        e.addStat(27, t.level)
    }
})
  , incomingDmgReduce = new BuffLogic({
    id: 109,
    type: 0,
    icon: "skills/charm1",
    fx: {
        stick: 61,
        color: [.3, .3, .3, .9]
    },
    beforeIncomingDamage: (t,e,n,a)=>n * (t.level / 100)
})
  , colFromHexInt = (t,e)=>{
    const n = [(t >> 16 & 255) / 255, (t >> 8 & 255) / 255, (255 & t) / 255];
    return void 0 !== e && n.push(e),
    n
}
  , qualities = [["white", "common"], ["green", "uncommon"], ["blue", "rare"], ["purp", "epic"]]
  , qualityStep = t=>t >= 90 ? 3 : t >= 70 ? 2 : t >= 50 ? 1 : 0
  , quality = t=>qualities[qualityStep(t)]
  , colors = {
    black: colFromHexInt(0, 0),
    white: colFromHexInt(16777215, 0),
    deadgrey: colFromHexInt(3355443, 0),
    teal: colFromHexInt(3384995, 0),
    magicblue: colFromHexInt(3362252, 0),
    paleskin: colFromHexInt(14267315, 0),
    darkskin: colFromHexInt(8411481, 0),
    slimegreen: colFromHexInt(2542694, 0),
    mushgreen: colFromHexInt(2077529, 0),
    linen: colFromHexInt(13408614, 0),
    woodbrown: colFromHexInt(4859433, 0),
    woodbrown2: colFromHexInt(10250315, 0),
    tealsteel: colFromHexInt(3358797, .5),
    darksteel: colFromHexInt(3355443, .5),
    greysteel: colFromHexInt(5066061, .5),
    blacksteel: colFromHexInt(988178, .5),
    leather: colFromHexInt(4337198, 0),
    emerald: colFromHexInt(22866, -.1),
    gold: colFromHexInt(16751616, .9),
    darkgold: colFromHexInt(16747008, .9),
    paper: colFromHexInt(15129011, 0),
    richpurple: colFromHexInt(7484623, 0),
    fireorange: colFromHexInt(14715686, -.7),
    archergreen: colFromHexInt(10471258, 0),
    warbrown: colFromHexInt(15172191, 0),
    bronze: colFromHexInt(9258571, .5),
    silver: colFromHexInt(11583679, .6),
    shamanblue: colFromHexInt(3687924, 0),
    mageblue: colFromHexInt(6607340, 0),
    bone: colFromHexInt(14535066, .2),
    bone2: colFromHexInt(11836267, .2),
    ice: colFromHexInt(14610164, -.2),
    vanguard: colFromHexInt(2848511, 0),
    bloodlust: colFromHexInt(14289947, 0),
    pink: colFromHexInt(16711935, 0),
    warden: colFromHexInt(14755623, 0),
    evilred: colFromHexInt(13239043, 0),
    ruby: colFromHexInt(15733030, 1),
    moss: colFromHexInt(2925637, .2),
    rock: colFromHexInt(5006687, .4),
    death: colFromHexInt(3750201, .8),
    diamond: colFromHexInt(3076559, .9)
}
  , mounts = [[30, 1e4, 50, 0, 6, {}], [30, 2e4, 50, 0, 21, {}], [30, 5e4, 80, 300, 21, {
    colEyes: colFromHexInt(11332842, 0),
    colPrim: colFromHexInt(4772165, -.2),
    colSec: colFromHexInt(1351204, -.2)
}], [30, 5e4, 80, 300, 21, {
    colEyes: colFromHexInt(16751284, 0),
    colPrim: colFromHexInt(15737892, .5),
    colSec: colFromHexInt(15737892, .5)
}], [30, 5e4, 95, 1200, 22, {
    colEyes: colFromHexInt(14292553, 0),
    colPrim: colFromHexInt(4075311, .1),
    colSec: colFromHexInt(1970198, .1)
}], [30, 5e4, 90, 600, 23, {
    colEyes: colFromHexInt(2029122, 0),
    colPrim: colFromHexInt(2565674, .3),
    colSec: colFromHexInt(2236197, .3)
}], [30, 5e4, 80, 300, 24, {
    colEyes: colFromHexInt(12825266, 0),
    colPrim: colFromHexInt(11313312, .1),
    colSec: colFromHexInt(8221555, .1)
}], [30, 5e4, 90, 600, 25, {}], [30, 5e4, 95, 1200, 27, {
    colEyes: colFromHexInt(12451327, 0),
    colPrim: colFromHexInt(3950066, -.4),
    colSec: colFromHexInt(3511541, -.4)
}], [30, 5e4, 95, 1200, 28, {
    colEyes: colFromHexInt(2747996, 0),
    colPrim: colFromHexInt(1907231, .4)
}], [30, 5e4, 80, 300, 30, {
    colEyes: colFromHexInt(16758891, 0),
    colPrim: colFromHexInt(15448667, .1),
    colSec: colFromHexInt(11370036, .1)
}], [30, 5e4, 95, 1200, 31, {
    colEyes: colFromHexInt(16777215, -.8),
    colPrim: colors.darksteel,
    colSec: colors.gold
}], [30, 5e4, 95, 1200, 32, {}], [30, 5e4, 85, 400, 29, {
    colEyes: colors.fireorange,
    colPrim: colors.darksteel
}], [30, 5e4, 95, 1200, 33, {}]].map(t=>({
    level: t[0],
    goldValue: t[1],
    storeValue: t[3],
    bindOnUse: 1,
    bindOnMerchant: t[3] > 0 ? 1 : 0,
    quality: t[2],
    visual: t[4],
    visualData: t[5]
}))
  , generate$6 = t=>{
    mounts.forEach((e,n)=>{
        t["mount" + n] = {
            ...e,
            type: "mount",
            tier: n,
            requiredSkill: 39,
            useSkill: 102,
            use: (t,e,a,s,r)=>({
                id: 92,
                mode: 4,
                stacks: 1,
                duration: 600,
                caster: t.id,
                target: t.id,
                buffdata: [n],
                sendBuffData: !0,
                level: e
            })
        }
    }
    )
}
  , mount$1 = new BuffLogic({
    id: 92,
    breakOnCast: !0,
    icon: "skills/39",
    fx: {
        mount: t=>mounts[t.data[0]].visual,
        mountVisualData: t=>mounts[t.data[0]].visualData,
        apply: 76,
        endSound: 69
    },
    statsStatic: (t,e)=>{
        e.addStat(15, 60)
    }
})
  , moveBoost = new BuffLogic({
    id: 111,
    type: 0,
    icon: "skills/charm3",
    fx: {
        stick: 62,
        color: [.3, 0, .6, .8]
    },
    statsStatic: (t,e)=>{
        e.addStat(15, t.level)
    }
})
  , obeliskbuff = new BuffLogic({
    id: 125,
    type: 0,
    maxStacks: 8,
    clearOnDeath: !1,
    icon: "skills/obeliskbuff"
})
  , pierce = new BuffLogic({
    id: 123,
    maxStacks: 25,
    type: 1,
    icon: "skills/pierce",
    multiplyIncomingDamage: {
        0: t=>1 + .2 * t.stacks,
        59: t=>1 + .2 * t.stacks
    }
})
  , postsummon = new BuffLogic({
    id: 103,
    icon: "skills/postsummon",
    fx: {
        stick: 80
    },
    unique: !0,
    statsStatic: (t,e)=>{
        e.addStat(15, 20)
    }
})
  , potion$1 = ["potionhp", "potionMp"].map((t,e)=>new BuffLogic({
    id: [97, 98][e],
    maxStacks: 1,
    icon: "skills/" + t,
    fx: {
        stick: [43, 83][e]
    },
    intervalHaste: !1,
    intervalDuration: .5,
    onInterval: (t,n,a)=>({
        id: 100,
        mode: [2, 3][e],
        caster: t.caster,
        target: n.id,
        heal: 1 == e ? void 0 : t.level,
        mprec: 0 == e ? void 0 : t.level,
        nocrit: !0
    })
}))
  , resetting = new BuffLogic({
    id: 94,
    passive: !0,
    immuneAll: !0,
    statsStatic: (t,e)=>{
        e.addStat(15, 100),
        e.addStat(12, 1e4)
    }
})
  , stun = new BuffLogic({
    id: 87,
    type: 1,
    tags: new Set([5]),
    dr: 1,
    incapacitated: !0,
    icon: "skills/stunBuff",
    fx: {
        stick: 86,
        incapacitated: !0
    },
    movementOverride: (t,e,n,a,s)=>{
        a.setSteer(0, 0),
        a.setJump(0)
    }
})
  , suddendeath = new BuffLogic({
    id: 102,
    maxStacks: 99,
    icon: "skills/suddenDeath",
    statsStatic: (t,e)=>{
        e.maxStat(30, t.stacks)
    }
})
  , general$1 = {
    obeliskbuff: obeliskbuff,
    boss_puddledotDebuff: boss_puddledotDebuff,
    pierce: pierce,
    worldBoss: new BuffLogic({
        id: 122,
        passive: !1,
        immuneCC: !0,
        icon: "skills/21",
        statsStatic: (t,e)=>{
            e.addStat(6, 5e5 * t.stacks),
            t.level > 1 && (e.addStat(17, 30),
            e.addStat(16, 1e3),
            e.addStat(15, 200),
            e.addStat(10, 500),
            e.addStat(11, 500))
        }
        ,
        onCast: {
            0: (t,e,n,a,s)=>{}
        }
    }),
    boss_flamepitDebuff: boss_flamepitDebuff,
    blueMarble: blueMarble,
    moveBoost: moveBoost,
    dmgBoost: dmgBoost,
    incomingDmgReduce: incomingDmgReduce,
    postsummon: postsummon,
    suddendeath: suddendeath,
    hppotion: potion$1[0],
    mppotion: potion$1[1],
    stun: stun,
    mount: mount$1,
    daze: daze,
    resetting: resetting
}
  , warrior$1 = {
    relentlessCryDebuff: relentlessCryDebuff,
    whirlwindChannel: whirlwindChannel,
    temperBoostBuff: temperBoostBuff,
    temperBuff: temperBuff,
    tauntDebuff: tauntDebuff,
    chargeBuff: chargeBuff,
    warcryBuff: warcryBuff,
    courageBuff: courageBuff,
    armorreinforcementBuff: armorreinforcementBuff,
    crescentBleedDebuff: crescentBleedDebuff,
    crescentBleedBuff: crescentBleedBuff,
    enrageBuff: enrageBuff,
    blockBuff: blockBuff$1,
    specializationWarrior: specializationWarrior
}
  , shaman$1 = {
    plaguespreaderBuff: plaguespreaderBuff,
    plaguespreaderBuffPassive: plaguespreaderBuffPassive,
    agonizeDebuff: agonizeDebuff,
    spiritanimalBuff: spiritanimalBuff,
    caninehowlBuff: caninehowlBuff,
    manaBuff: manaBuff,
    revitalizeBuff: revitalizeBuff,
    specializationShaman: specializationShaman,
    decayBuff: decayBuff
}
  , mage$1 = {
    iceBlockBuff: iceBlockBuff,
    frostcallChannel: frostcallChannel,
    extraboltBuff: extraboltBuff,
    deepFrozenBuff: deepFrozenBuff,
    iceboltBuff: iceboltBuff,
    frozenBuff: frozenBuff,
    enchantmentBuff: enchantmentBuff,
    arcticauraBuff: arcticauraBuff,
    iceshieldBuff: iceshieldBuff,
    icicleBuff: icicleBuff,
    frostnovaBuff: frostnovaBuff,
    specializationMage: specializationMage,
    hypothermicBuff: hypothermicBuff
}
  , archer$1 = {
    boneArrowBuff: boneArrowBuff,
    blindingShotDebuff: blindingShotDebuff,
    vampiricArrowBuff: vampiricArrowBuff,
    volleyChannel: volleyChannel,
    snipeMoveBuff: snipeMoveBuff,
    preciseshotBuff: preciseshotBuff,
    snipeBuff: snipeBuff,
    poisonarrowsBuff: poisonarrowsBuff,
    poisonarrowsDebuff: poisonarrowsDebuff,
    temporaldilationBuff: temporaldilationBuff,
    pathfindingBuff: pathfindingBuff,
    cranialpuncturesBuff: cranialpuncturesBuff,
    specializationArcher: specializationArcher,
    serpentArrowsBuff: serpentArrowsBuff,
    invigorateBuff: invigorateBuff
}
  , list$1 = new Map;
[general$1, warrior$1, shaman$1, mage$1, archer$1].forEach(t=>{
    for (const e in t)
        list$1.set(t[e].id, t[e])
}
);
class Timer {
    constructor(t=0, e=0) {
        this.start = t,
        this.end = t + e,
        this.duration = e
    }
    done(t) {
        return t > this.end
    }
    fraction(t) {
        return clamp(1 - (this.end - t) / this.duration, 0, 1)
    }
    remaining(t) {
        return this.end - t
    }
    passed(t) {
        return t - this.start
    }
    reset(t, e=this.duration) {
        return this.start = t,
        this.end = t + e,
        this.duration = e,
        !0
    }
    set(t, e) {
        return this.start = t,
        this.end = e,
        this.duration = this.end - this.start,
        !0
    }
}
class CoreStats {
    constructor(t) {
        this.entity = t,
        this.alive = !0,
        this.stat = new Map,
        this.resource = new Map,
        this.combatTimer = new Timer(-1,6)
    }
    tick(t, e) {
        this.combatTimer.start > 0 && this.combatTimer.done(e) && this.onCombatEnd(e)
    }
    die() {
        return !!this.alive && (this.alive = !1,
        this.entity.skills.onDeath(),
        this.entity.buffs.onDeath(),
        !0)
    }
    getStat(t) {
        return 0 | this.stat.get(t)
    }
    getResource(t) {
        return 0 | this.resource.get(t)
    }
    addStat(t, e) {
        this.stat.set(t, (0 | this.stat.get(t)) + e)
    }
    maxStat(t, e) {
        this.stat.set(t, Math.max(0 | this.stat.get(t), e))
    }
    multiplyStat(t, e) {
        this.stat.set(t, (0 | this.stat.get(t)) * e)
    }
    setResource(t, e) {
        const n = Math.round(clamp(e, 0, this.getStat(t)));
        return this.resource.set(t, n),
        n
    }
    changeResource(t, e) {
        return this.setResource(t, this.getResource(t) + e)
    }
    respawn() {
        this.alive = !0,
        this.onCombatEnd()
    }
    clear() {}
    refreshCombatTimer(t, e) {
        this.combatTimer.end < t + e && this.combatTimer.reset(t, e)
    }
    onCombatEnd() {
        this.combatTimer.reset(-1)
    }
    getDamageRoll() {
        return Math.round((this.getStat(10) + this.getStat(11)) / 2)
    }
}
function get_each_context$2(t, e, n) {
    const a = t.slice();
    return a[13] = e[n],
    a
}
function get_each_context_1$2(t, e, n) {
    const a = t.slice();
    return a[16] = e[n],
    a
}
function get_each_context_2$2(t, e, n) {
    const a = t.slice();
    return a[19] = e[n],
    a
}
function get_each_context_3$2(t, e, n) {
    const a = t.slice();
    return a[19] = e[n],
    a
}
function get_each_context_5$1(t, e, n) {
    const a = t.slice();
    return a[27] = e[n],
    a
}
function get_each_context_4$2(t, e, n) {
    const a = t.slice();
    return a[24] = e[n],
    a
}
function get_each_context_7(t, e, n) {
    const a = t.slice();
    return a[27] = e[n],
    a
}
function get_each_context_6$1(t, e, n) {
    const a = t.slice();
    return a[24] = e[n],
    a
}
function get_each_context_9(t, e, n) {
    const a = t.slice();
    return a[27] = e[n],
    a
}
function get_each_context_8(t, e, n) {
    const a = t.slice();
    return a[34] = e[n],
    a
}
function create_else_block$2(t) {
    let e, n, a, s, r, i, o, l, c, d, p, u, m, f, g, h, _, b, k, y, v, x, w, S = !t[2] && void 0 === t[0].parent && create_if_block_19(t), $ = t[0].actiontype && create_if_block_18(t), I = t[0].auto && create_if_block_17$1(), C = t[0].costMp && create_if_block_16$1(t), L = t[0].castLen && create_if_block_15$1(t), B = t[0].cd && create_if_block_14$1(t), M = t[0].duration > 0 && create_if_block_13$1(t), U = t[0].unique && create_if_block_12$1(), D = t[0].refresh && create_if_block_11$1(), E = t[0].range && create_if_block_10$1(t), O = t[7][t[0].targetMode] && create_if_block_9$1(t), V = t[0].maxStacks && create_if_block_8$1(t), A = t[0].dmg && create_if_block_7$1(t), P = t[0].heal && create_if_block_6$1(t), F = [t[0].multiplyIncomingHeal, t[0].multiplyIncomingDamage], q = [];
    for (let e = 0; e < 2; e += 1)
        q[e] = create_each_block_8(get_each_context_8(t, F, e));
    let H = [t[0].addIncomingHeal, t[0].addIncomingDamage]
      , R = [];
    for (let e = 0; e < 2; e += 1)
        R[e] = create_each_block_6$1(get_each_context_6$1(t, H, e));
    let T = [t[0].addIncomingCrit]
      , j = [];
    for (let e = 0; e < 1; e += 1)
        j[e] = create_each_block_4$2(get_each_context_4$2(t, T, e));
    let N = t[0].statsStatic && create_if_block_5$1(t)
      , z = t[0].statsConvert && create_if_block_4$1(t)
      , Y = t[0].custom && create_if_block_3$1(t)
      , W = t[0].aoe && t[0].aoe.circleRadius && create_if_block_2$1(t)
      , G = !t[0].parent && create_if_block_1$2(t)
      , Q = t[3]
      , J = [];
    for (let e = 0; e < Q.length; e += 1)
        J[e] = create_each_block$2(get_each_context$2(t, Q, e));
    const K = t=>transition_out(J[t], 1, 1, ()=>{
        J[t] = null
    }
    );
    return {
        c() {
            S && S.c(),
            e = element("div"),
            $ && $.c(),
            n = empty(),
            I && I.c(),
            a = empty(),
            C && C.c(),
            s = empty(),
            L && L.c(),
            r = empty(),
            B && B.c(),
            i = empty(),
            M && M.c(),
            o = empty(),
            U && U.c(),
            l = empty(),
            D && D.c(),
            c = element("div"),
            E && E.c(),
            d = empty(),
            O && O.c(),
            V && V.c(),
            p = empty(),
            A && A.c(),
            u = empty(),
            P && P.c(),
            m = empty();
            for (let t = 0; t < 2; t += 1)
                q[t].c();
            f = empty();
            for (let t = 0; t < 2; t += 1)
                R[t].c();
            g = empty();
            for (let t = 0; t < 1; t += 1)
                j[t].c();
            h = empty(),
            N && N.c(),
            _ = empty(),
            z && z.c(),
            b = empty(),
            Y && Y.c(),
            k = empty(),
            W && W.c(),
            y = empty(),
            G && G.c(),
            v = empty();
            for (let t = 0; t < J.length; t += 1)
                J[t].c();
            x = empty(),
            attr(e, "class", "pad textgreen svelte-14w0l4b")
        },
        m(t, F) {
            S && S.m(t, F),
            insert(t, e, F),
            $ && $.m(e, null),
            append(e, n),
            I && I.m(e, null),
            append(e, a),
            C && C.m(e, null),
            append(e, s),
            L && L.m(e, null),
            append(e, r),
            B && B.m(e, null),
            append(e, i),
            M && M.m(e, null),
            append(e, o),
            U && U.m(e, null),
            append(e, l),
            D && D.m(e, null),
            append(e, c),
            E && E.m(c, null),
            append(c, d),
            O && O.m(c, null),
            V && V.m(t, F),
            insert(t, p, F),
            A && A.m(t, F),
            insert(t, u, F),
            P && P.m(t, F),
            insert(t, m, F);
            for (let e = 0; e < 2; e += 1)
                q[e].m(t, F);
            insert(t, f, F);
            for (let e = 0; e < 2; e += 1)
                R[e].m(t, F);
            insert(t, g, F);
            for (let e = 0; e < 1; e += 1)
                j[e].m(t, F);
            insert(t, h, F),
            N && N.m(t, F),
            insert(t, _, F),
            z && z.m(t, F),
            insert(t, b, F),
            Y && Y.m(t, F),
            insert(t, k, F),
            W && W.m(t, F),
            insert(t, y, F),
            G && G.m(t, F),
            insert(t, v, F);
            for (let e = 0; e < J.length; e += 1)
                J[e].m(t, F);
            insert(t, x, F),
            w = !0
        },
        p(t, w) {
            if (t[2] || void 0 !== t[0].parent ? S && (S.d(1),
            S = null) : S ? S.p(t, w) : (S = create_if_block_19(t),
            S.c(),
            S.m(e.parentNode, e)),
            t[0].actiontype ? $ ? $.p(t, w) : ($ = create_if_block_18(t),
            $.c(),
            $.m(e, n)) : $ && ($.d(1),
            $ = null),
            t[0].auto ? I || (I = create_if_block_17$1(),
            I.c(),
            I.m(e, a)) : I && (I.d(1),
            I = null),
            t[0].costMp ? C ? C.p(t, w) : (C = create_if_block_16$1(t),
            C.c(),
            C.m(e, s)) : C && (C.d(1),
            C = null),
            t[0].castLen ? L ? L.p(t, w) : (L = create_if_block_15$1(t),
            L.c(),
            L.m(e, r)) : L && (L.d(1),
            L = null),
            t[0].cd ? B ? B.p(t, w) : (B = create_if_block_14$1(t),
            B.c(),
            B.m(e, i)) : B && (B.d(1),
            B = null),
            t[0].duration > 0 ? M ? M.p(t, w) : (M = create_if_block_13$1(t),
            M.c(),
            M.m(e, o)) : M && (M.d(1),
            M = null),
            t[0].unique ? U || (U = create_if_block_12$1(),
            U.c(),
            U.m(e, l)) : U && (U.d(1),
            U = null),
            t[0].refresh ? D || (D = create_if_block_11$1(),
            D.c(),
            D.m(e, c)) : D && (D.d(1),
            D = null),
            t[0].range ? E ? E.p(t, w) : (E = create_if_block_10$1(t),
            E.c(),
            E.m(c, d)) : E && (E.d(1),
            E = null),
            t[7][t[0].targetMode] ? O ? O.p(t, w) : (O = create_if_block_9$1(t),
            O.c(),
            O.m(c, null)) : O && (O.d(1),
            O = null),
            t[0].maxStacks ? V ? V.p(t, w) : (V = create_if_block_8$1(t),
            V.c(),
            V.m(p.parentNode, p)) : V && (V.d(1),
            V = null),
            t[0].dmg ? A ? A.p(t, w) : (A = create_if_block_7$1(t),
            A.c(),
            A.m(u.parentNode, u)) : A && (A.d(1),
            A = null),
            t[0].heal ? P ? P.p(t, w) : (P = create_if_block_6$1(t),
            P.c(),
            P.m(m.parentNode, m)) : P && (P.d(1),
            P = null),
            257 & w[0]) {
                let e;
                for (F = [t[0].multiplyIncomingHeal, t[0].multiplyIncomingDamage],
                e = 0; e < 2; e += 1) {
                    const n = get_each_context_8(t, F, e);
                    q[e] ? q[e].p(n, w) : (q[e] = create_each_block_8(n),
                    q[e].c(),
                    q[e].m(f.parentNode, f))
                }
                for (; e < 2; e += 1)
                    q[e].d(1)
            }
            if (257 & w[0]) {
                let e;
                for (H = [t[0].addIncomingHeal, t[0].addIncomingDamage],
                e = 0; e < 2; e += 1) {
                    const n = get_each_context_6$1(t, H, e);
                    R[e] ? R[e].p(n, w) : (R[e] = create_each_block_6$1(n),
                    R[e].c(),
                    R[e].m(g.parentNode, g))
                }
                for (; e < 2; e += 1)
                    R[e].d(1)
            }
            if (257 & w[0]) {
                let e;
                for (T = [t[0].addIncomingCrit],
                e = 0; e < 1; e += 1) {
                    const n = get_each_context_4$2(t, T, e);
                    j[e] ? j[e].p(n, w) : (j[e] = create_each_block_4$2(n),
                    j[e].c(),
                    j[e].m(h.parentNode, h))
                }
                for (; e < 1; e += 1)
                    j[e].d(1)
            }
            if (t[0].statsStatic ? N ? N.p(t, w) : (N = create_if_block_5$1(t),
            N.c(),
            N.m(_.parentNode, _)) : N && (N.d(1),
            N = null),
            t[0].statsConvert ? z ? z.p(t, w) : (z = create_if_block_4$1(t),
            z.c(),
            z.m(b.parentNode, b)) : z && (z.d(1),
            z = null),
            t[0].custom ? Y ? Y.p(t, w) : (Y = create_if_block_3$1(t),
            Y.c(),
            Y.m(k.parentNode, k)) : Y && (Y.d(1),
            Y = null),
            t[0].aoe && t[0].aoe.circleRadius ? W ? W.p(t, w) : (W = create_if_block_2$1(t),
            W.c(),
            W.m(y.parentNode, y)) : W && (W.d(1),
            W = null),
            t[0].parent ? G && (G.d(1),
            G = null) : G ? G.p(t, w) : (G = create_if_block_1$2(t),
            G.c(),
            G.m(v.parentNode, v)),
            10 & w[0]) {
                let e;
                for (Q = t[3],
                e = 0; e < Q.length; e += 1) {
                    const n = get_each_context$2(t, Q, e);
                    J[e] ? (J[e].p(n, w),
                    transition_in(J[e], 1)) : (J[e] = create_each_block$2(n),
                    J[e].c(),
                    transition_in(J[e], 1),
                    J[e].m(x.parentNode, x))
                }
                for (group_outros(),
                e = Q.length; e < J.length; e += 1)
                    K(e);
                check_outros()
            }
        },
        i(t) {
            if (!w) {
                for (let t = 0; t < Q.length; t += 1)
                    transition_in(J[t]);
                w = !0
            }
        },
        o(t) {
            J = J.filter(Boolean);
            for (let t = 0; t < J.length; t += 1)
                transition_out(J[t]);
            w = !1
        },
        d(t) {
            S && S.d(t),
            t && detach(e),
            $ && $.d(),
            I && I.d(),
            C && C.d(),
            L && L.d(),
            B && B.d(),
            M && M.d(),
            U && U.d(),
            D && D.d(),
            E && E.d(),
            O && O.d(),
            V && V.d(t),
            t && detach(p),
            A && A.d(t),
            t && detach(u),
            P && P.d(t),
            t && detach(m),
            destroy_each(q, t),
            t && detach(f),
            destroy_each(R, t),
            t && detach(g),
            destroy_each(j, t),
            t && detach(h),
            N && N.d(t),
            t && detach(_),
            z && z.d(t),
            t && detach(b),
            Y && Y.d(t),
            t && detach(k),
            W && W.d(t),
            t && detach(y),
            G && G.d(t),
            t && detach(v),
            destroy_each(J, t),
            t && detach(x)
        }
    }
}
function create_if_block$2(t) {
    let e, n, a = t[0].item + "";
    return {
        c() {
            e = element("div"),
            n = text(a)
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p(t, e) {
            1 & e[0] && a !== (a = t[0].item + "") && set_data(n, a)
        },
        i: noop,
        o: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_19(t) {
    let e, n, a, s, r, i, o = loc.items.book[t[0].id].name + "", l = t[0].engineOnly ? "" : " Lv. " + t[1];
    return {
        c() {
            e = element("div"),
            n = element("img"),
            s = space(),
            r = text(o),
            i = text(l),
            attr(n, "class", "texticon"),
            n.src !== (a = skill(t[0].id)) && attr(n, "src", a),
            attr(e, "class", "slottitle textprimary")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n),
            append(e, s),
            append(e, r),
            append(e, i)
        },
        p(t, e) {
            1 & e[0] && n.src !== (a = skill(t[0].id)) && attr(n, "src", a),
            1 & e[0] && o !== (o = loc.items.book[t[0].id].name + "") && set_data(r, o),
            3 & e[0] && l !== (l = t[0].engineOnly ? "" : " Lv. " + t[1]) && set_data(i, l)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_18(t) {
    let e, n, a, s, r = t[9][t[0].mode] + "", i = t[0].actiontype + "";
    return {
        c() {
            e = element("div"),
            n = text(r),
            a = space(),
            s = text(i),
            attr(e, "class", "textwhite")
        },
        m(t, r) {
            insert(t, e, r),
            append(e, n),
            append(e, a),
            append(e, s)
        },
        p(t, e) {
            1 & e[0] && r !== (r = t[9][t[0].mode] + "") && set_data(n, r),
            1 & e[0] && i !== (i = t[0].actiontype + "") && set_data(s, i)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_17$1(t) {
    let e;
    return {
        c() {
            e = element("div"),
            e.textContent = "Auto cast"
        },
        m(t, n) {
            insert(t, e, n)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_16$1(t) {
    let e, n, a, s, r, i = t[0].costMp(t[1]) + "", o = loc.ui.stats.array[7] + "";
    return {
        c() {
            e = element("div"),
            n = text("Cost: "),
            a = text(i),
            s = space(),
            r = text(o)
        },
        m(t, i) {
            insert(t, e, i),
            append(e, n),
            append(e, a),
            append(e, s),
            append(e, r)
        },
        p(t, e) {
            3 & e[0] && i !== (i = t[0].costMp(t[1]) + "") && set_data(a, i)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_15$1(t) {
    let e, n, a, s = t[8](t[0].castLen) + "";
    return {
        c() {
            e = element("div"),
            n = text(s),
            a = text("s Cast time")
        },
        m(t, s) {
            insert(t, e, s),
            append(e, n),
            append(e, a)
        },
        p(t, e) {
            1 & e[0] && s !== (s = t[8](t[0].castLen) + "") && set_data(n, s)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_14$1(t) {
    let e, n, a, s = t[8](t[0].cd) + "";
    return {
        c() {
            e = element("div"),
            n = text(s),
            a = text("s Cooldown")
        },
        m(t, s) {
            insert(t, e, s),
            append(e, n),
            append(e, a)
        },
        p(t, e) {
            1 & e[0] && s !== (s = t[8](t[0].cd) + "") && set_data(n, s)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_13$1(t) {
    let e, n, a, s = t[8](t[0].duration) + "";
    return {
        c() {
            e = element("div"),
            n = text(s),
            a = text("s Duration")
        },
        m(t, s) {
            insert(t, e, s),
            append(e, n),
            append(e, a)
        },
        p(t, e) {
            1 & e[0] && s !== (s = t[8](t[0].duration) + "") && set_data(n, s)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_12$1(t) {
    let e;
    return {
        c() {
            e = element("div"),
            e.textContent = "Unique"
        },
        m(t, n) {
            insert(t, e, n)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_11$1(t) {
    let e;
    return {
        c() {
            e = element("div"),
            e.textContent = "Stacks refresh duration"
        },
        m(t, n) {
            insert(t, e, n)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_10$1(t) {
    let e, n, a, s = t[8](t[0].range) + "";
    return {
        c() {
            e = element("span"),
            n = text(s),
            a = text("m range ")
        },
        m(t, s) {
            insert(t, e, s),
            append(e, n),
            append(e, a)
        },
        p(t, e) {
            1 & e[0] && s !== (s = t[8](t[0].range) + "") && set_data(n, s)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_9$1(t) {
    let e, n, a = t[7][t[0].targetMode] + "";
    return {
        c() {
            e = element("span"),
            n = text(a)
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p(t, e) {
            1 & e[0] && a !== (a = t[7][t[0].targetMode] + "") && set_data(n, a)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_8$1(t) {
    let e, n, a, s, r, i, o, l = t[5].stacks + "";
    return {
        c() {
            e = element("div"),
            n = element("u"),
            a = text("At "),
            s = text(l),
            r = text(" stacks"),
            i = text(":"),
            o = element("span"),
            o.textContent = "(Press shift to toggle)",
            attr(e, "class", "pad textsecondary svelte-14w0l4b"),
            attr(o, "class", "textgrey")
        },
        m(t, l) {
            insert(t, e, l),
            append(e, n),
            append(n, a),
            append(n, s),
            append(n, r),
            append(e, i),
            insert(t, o, l)
        },
        p(t, e) {
            32 & e[0] && l !== (l = t[5].stacks + "") && set_data(s, l)
        },
        d(t) {
            t && detach(e),
            t && detach(o)
        }
    }
}
function create_if_block_7$1(t) {
    let e, n, a, s = t[8](t[0].dmg) + "";
    return {
        c() {
            e = element("div"),
            n = text(s),
            a = text(" DMG"),
            attr(e, "class", "textgreen")
        },
        m(t, s) {
            insert(t, e, s),
            append(e, n),
            append(e, a)
        },
        p(t, e) {
            1 & e[0] && s !== (s = t[8](t[0].dmg) + "") && set_data(n, s)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_6$1(t) {
    let e, n, a, s = t[8](t[0].heal) + "";
    return {
        c() {
            e = element("div"),
            n = text(s),
            a = text(" Heal"),
            attr(e, "class", "textgreen")
        },
        m(t, s) {
            insert(t, e, s),
            append(e, n),
            append(e, a)
        },
        p(t, e) {
            1 & e[0] && s !== (s = t[8](t[0].heal) + "") && set_data(n, s)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_each_block_9(t) {
    let e, n, a, s, r, i, o = loc.items.book[t[27]].name + "", l = Math.round(100 * t[8](t[34][t[27]](t[0])) - 100) + "";
    return {
        c() {
            e = element("div"),
            n = text("Empower "),
            a = text(o),
            s = text(" by "),
            r = text(l),
            i = text("%"),
            attr(e, "class", "textcyan")
        },
        m(t, o) {
            insert(t, e, o),
            append(e, n),
            append(e, a),
            append(e, s),
            append(e, r),
            append(e, i)
        },
        p(t, e) {
            1 & e[0] && o !== (o = loc.items.book[t[27]].name + "") && set_data(a, o),
            1 & e[0] && l !== (l = Math.round(100 * t[8](t[34][t[27]](t[0])) - 100) + "") && set_data(r, l)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_each_block_8(t) {
    let e, n = Object.keys(t[34] || {}), a = [];
    for (let e = 0; e < n.length; e += 1)
        a[e] = create_each_block_9(get_each_context_9(t, n, e));
    return {
        c() {
            for (let t = 0; t < a.length; t += 1)
                a[t].c();
            e = empty()
        },
        m(t, n) {
            for (let e = 0; e < a.length; e += 1)
                a[e].m(t, n);
            insert(t, e, n)
        },
        p(t, s) {
            if (257 & s[0]) {
                let r;
                for (n = Object.keys(t[34] || {}),
                r = 0; r < n.length; r += 1) {
                    const i = get_each_context_9(t, n, r);
                    a[r] ? a[r].p(i, s) : (a[r] = create_each_block_9(i),
                    a[r].c(),
                    a[r].m(e.parentNode, e))
                }
                for (; r < a.length; r += 1)
                    a[r].d(1);
                a.length = n.length
            }
        },
        d(t) {
            destroy_each(a, t),
            t && detach(e)
        }
    }
}
function create_each_block_7(t) {
    let e, n, a, s, r, i = loc.items.book[t[27]].name + "", o = t[8](t[24][t[27]](t[0])) + "";
    return {
        c() {
            e = element("div"),
            n = text("Empower "),
            a = text(i),
            s = text(" by "),
            r = text(o),
            attr(e, "class", "textcyan")
        },
        m(t, i) {
            insert(t, e, i),
            append(e, n),
            append(e, a),
            append(e, s),
            append(e, r)
        },
        p(t, e) {
            1 & e[0] && i !== (i = loc.items.book[t[27]].name + "") && set_data(a, i),
            1 & e[0] && o !== (o = t[8](t[24][t[27]](t[0])) + "") && set_data(r, o)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_each_block_6$1(t) {
    let e, n = Object.keys(t[24] || {}), a = [];
    for (let e = 0; e < n.length; e += 1)
        a[e] = create_each_block_7(get_each_context_7(t, n, e));
    return {
        c() {
            for (let t = 0; t < a.length; t += 1)
                a[t].c();
            e = empty()
        },
        m(t, n) {
            for (let e = 0; e < a.length; e += 1)
                a[e].m(t, n);
            insert(t, e, n)
        },
        p(t, s) {
            if (257 & s[0]) {
                let r;
                for (n = Object.keys(t[24] || {}),
                r = 0; r < n.length; r += 1) {
                    const i = get_each_context_7(t, n, r);
                    a[r] ? a[r].p(i, s) : (a[r] = create_each_block_7(i),
                    a[r].c(),
                    a[r].m(e.parentNode, e))
                }
                for (; r < a.length; r += 1)
                    a[r].d(1);
                a.length = n.length
            }
        },
        d(t) {
            destroy_each(a, t),
            t && detach(e)
        }
    }
}
function create_each_block_5$1(t) {
    let e, n, a, s, r, i = loc.items.book[t[27]].name + "", o = stat(14, t[8](t[24][t[27]](t[0]))) + "";
    return {
        c() {
            e = element("div"),
            n = text("Empower Crit% of "),
            a = text(i),
            s = text(" by "),
            r = text(o),
            attr(e, "class", "textcyan")
        },
        m(t, i) {
            insert(t, e, i),
            append(e, n),
            append(e, a),
            append(e, s),
            append(e, r)
        },
        p(t, e) {
            1 & e[0] && i !== (i = loc.items.book[t[27]].name + "") && set_data(a, i),
            1 & e[0] && o !== (o = stat(14, t[8](t[24][t[27]](t[0]))) + "") && set_data(r, o)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_each_block_4$2(t) {
    let e, n = Object.keys(t[24] || {}), a = [];
    for (let e = 0; e < n.length; e += 1)
        a[e] = create_each_block_5$1(get_each_context_5$1(t, n, e));
    return {
        c() {
            for (let t = 0; t < a.length; t += 1)
                a[t].c();
            e = empty()
        },
        m(t, n) {
            for (let e = 0; e < a.length; e += 1)
                a[e].m(t, n);
            insert(t, e, n)
        },
        p(t, s) {
            if (257 & s[0]) {
                let r;
                for (n = Object.keys(t[24] || {}),
                r = 0; r < n.length; r += 1) {
                    const i = get_each_context_5$1(t, n, r);
                    a[r] ? a[r].p(i, s) : (a[r] = create_each_block_5$1(i),
                    a[r].c(),
                    a[r].m(e.parentNode, e))
                }
                for (; r < a.length; r += 1)
                    a[r].d(1);
                a.length = n.length
            }
        },
        d(t) {
            destroy_each(a, t),
            t && detach(e)
        }
    }
}
function create_if_block_5$1(t) {
    let e, n = Array.from(t[4].stat), a = [];
    for (let e = 0; e < n.length; e += 1)
        a[e] = create_each_block_3$2(get_each_context_3$2(t, n, e));
    return {
        c() {
            for (let t = 0; t < a.length; t += 1)
                a[t].c();
            e = empty()
        },
        m(t, n) {
            for (let e = 0; e < a.length; e += 1)
                a[e].m(t, n);
            insert(t, e, n)
        },
        p(t, s) {
            if (16 & s[0]) {
                let r;
                for (n = Array.from(t[4].stat),
                r = 0; r < n.length; r += 1) {
                    const i = get_each_context_3$2(t, n, r);
                    a[r] ? a[r].p(i, s) : (a[r] = create_each_block_3$2(i),
                    a[r].c(),
                    a[r].m(e.parentNode, e))
                }
                for (; r < a.length; r += 1)
                    a[r].d(1);
                a.length = n.length
            }
        },
        d(t) {
            destroy_each(a, t),
            t && detach(e)
        }
    }
}
function create_each_block_3$2(t) {
    let e, n, a, s, r, i, o = stat(t[19][0], t[19][1]) + "", l = loc.ui.stats.array[t[19][0]] + "";
    return {
        c() {
            e = element("div"),
            n = text("+"),
            a = text(o),
            s = space(),
            r = text(l),
            i = space(),
            attr(e, "class", "textcyan")
        },
        m(t, o) {
            insert(t, e, o),
            append(e, n),
            append(e, a),
            append(e, s),
            append(e, r),
            append(e, i)
        },
        p(t, e) {
            16 & e[0] && o !== (o = stat(t[19][0], t[19][1]) + "") && set_data(a, o),
            16 & e[0] && l !== (l = loc.ui.stats.array[t[19][0]] + "") && set_data(r, l)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_4$1(t) {
    let e, n = t[0].statsConvert, a = [];
    for (let e = 0; e < n.length; e += 1)
        a[e] = create_each_block_2$2(get_each_context_2$2(t, n, e));
    return {
        c() {
            for (let t = 0; t < a.length; t += 1)
                a[t].c();
            e = empty()
        },
        m(t, n) {
            for (let e = 0; e < a.length; e += 1)
                a[e].m(t, n);
            insert(t, e, n)
        },
        p(t, s) {
            if (1 & s[0]) {
                let r;
                for (n = t[0].statsConvert,
                r = 0; r < n.length; r += 1) {
                    const i = get_each_context_2$2(t, n, r);
                    a[r] ? a[r].p(i, s) : (a[r] = create_each_block_2$2(i),
                    a[r].c(),
                    a[r].m(e.parentNode, e))
                }
                for (; r < a.length; r += 1)
                    a[r].d(1);
                a.length = n.length
            }
        },
        d(t) {
            destroy_each(a, t),
            t && detach(e)
        }
    }
}
function create_each_block_2$2(t) {
    let e, n, a, s, r, i, o, l = loc.ui.stats.array[t[19][0]] + "", c = stat(t[19][0], t[19][1]) + "", d = loc.ui.stats.array[t[19][2]] + "";
    return {
        c() {
            e = element("div"),
            n = text("For 1 "),
            a = text(l),
            s = text(" gain "),
            r = text(c),
            i = space(),
            o = text(d),
            attr(e, "class", "textcyan")
        },
        m(t, l) {
            insert(t, e, l),
            append(e, n),
            append(e, a),
            append(e, s),
            append(e, r),
            append(e, i),
            append(e, o)
        },
        p(t, e) {
            1 & e[0] && l !== (l = loc.ui.stats.array[t[19][0]] + "") && set_data(a, l),
            1 & e[0] && c !== (c = stat(t[19][0], t[19][1]) + "") && set_data(r, c),
            1 & e[0] && d !== (d = loc.ui.stats.array[t[19][2]] + "") && set_data(o, d)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_3$1(t) {
    let e, n = t[0].custom, a = [];
    for (let e = 0; e < n.length; e += 1)
        a[e] = create_each_block_1$2(get_each_context_1$2(t, n, e));
    return {
        c() {
            for (let t = 0; t < a.length; t += 1)
                a[t].c();
            e = empty()
        },
        m(t, n) {
            for (let e = 0; e < a.length; e += 1)
                a[e].m(t, n);
            insert(t, e, n)
        },
        p(t, s) {
            if (259 & s[0]) {
                let r;
                for (n = t[0].custom,
                r = 0; r < n.length; r += 1) {
                    const i = get_each_context_1$2(t, n, r);
                    a[r] ? a[r].p(i, s) : (a[r] = create_each_block_1$2(i),
                    a[r].c(),
                    a[r].m(e.parentNode, e))
                }
                for (; r < a.length; r += 1)
                    a[r].d(1);
                a.length = n.length
            }
        },
        d(t) {
            destroy_each(a, t),
            t && detach(e)
        }
    }
}
function create_each_block_1$2(t) {
    let e, n, a, s = t[8](t[16][0](t[1])) + "", r = t[16][1] + "";
    return {
        c() {
            e = element("div"),
            n = text(s),
            a = text(r),
            attr(e, "class", "textcyan")
        },
        m(t, s) {
            insert(t, e, s),
            append(e, n),
            append(e, a)
        },
        p(t, e) {
            3 & e[0] && s !== (s = t[8](t[16][0](t[1])) + "") && set_data(n, s),
            1 & e[0] && r !== (r = t[16][1] + "") && set_data(a, r)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_2$1(t) {
    let e, n, a, s, r, i, o, l = t[0].aoe.limit ? "Up to " + t[0].aoe.limit : "All", c = t[0].aoe.faction ? "allies" : "enemies", d = t[8](t[0].aoe.circleRadius) + "";
    return {
        c() {
            e = element("div"),
            n = text(l),
            a = space(),
            s = text(c),
            r = text(" within "),
            i = text(d),
            o = text("m"),
            attr(e, "class", "textpvp")
        },
        m(t, l) {
            insert(t, e, l),
            append(e, n),
            append(e, a),
            append(e, s),
            append(e, r),
            append(e, i),
            append(e, o)
        },
        p(t, e) {
            1 & e[0] && l !== (l = t[0].aoe.limit ? "Up to " + t[0].aoe.limit : "All") && set_data(n, l),
            1 & e[0] && c !== (c = t[0].aoe.faction ? "allies" : "enemies") && set_data(s, c),
            1 & e[0] && d !== (d = t[8](t[0].aoe.circleRadius) + "") && set_data(i, d)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_1$2(t) {
    let e, n, a, s, r = loc.items.book[t[0].id].description + "";
    return {
        c() {
            e = element("div"),
            n = element("u"),
            n.textContent = "Effect",
            a = text(": "),
            s = text(r),
            attr(e, "class", "textsecondary pad svelte-14w0l4b")
        },
        m(t, r) {
            insert(t, e, r),
            append(e, n),
            append(e, a),
            append(e, s)
        },
        p(t, e) {
            1 & e[0] && r !== (r = loc.items.book[t[0].id].description + "") && set_data(s, r)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_each_block$2(t) {
    let e, n, a;
    return n = new Skilldescription({
        props: {
            level: t[1],
            skill: t[13]
        }
    }),
    {
        c() {
            e = element("div"),
            create_component(n.$$.fragment),
            attr(e, "class", "pad svelte-14w0l4b")
        },
        m(t, s) {
            insert(t, e, s),
            mount_component(n, e, null),
            a = !0
        },
        p(t, e) {
            const a = {};
            2 & e[0] && (a.level = t[1]),
            8 & e[0] && (a.skill = t[13]),
            n.$set(a)
        },
        i(t) {
            a || (transition_in(n.$$.fragment, t),
            a = !0)
        },
        o(t) {
            transition_out(n.$$.fragment, t),
            a = !1
        },
        d(t) {
            t && detach(e),
            destroy_component(n)
        }
    }
}
function create_fragment$3(t) {
    let e, n, a, s;
    const r = [create_if_block$2, create_else_block$2]
      , i = [];
    function o(t, e) {
        return t[0].item ? 0 : 1
    }
    return n = o(t),
    a = i[n] = r[n](t),
    {
        c() {
            e = element("div"),
            a.c(),
            attr(e, "class", "container textsecondary svelte-14w0l4b")
        },
        m(t, a) {
            insert(t, e, a),
            i[n].m(e, null),
            s = !0
        },
        p(t, s) {
            let l = n;
            n = o(t),
            n === l ? i[n].p(t, s) : (group_outros(),
            transition_out(i[l], 1, 1, ()=>{
                i[l] = null
            }
            ),
            check_outros(),
            a = i[n],
            a || (a = i[n] = r[n](t),
            a.c()),
            transition_in(a, 1),
            a.m(e, null))
        },
        i(t) {
            s || (transition_in(a),
            s = !0)
        },
        o(t) {
            transition_out(a),
            s = !1
        },
        d(t) {
            t && detach(e),
            i[n].d()
        }
    }
}
function instance$3(t, e, n) {
    let a, {skill: s} = e, {level: r} = e, {asItemDescription: i=!1} = e, o = buttons.shift.store;
    component_subscribe(t, o, t=>n(10, a = t));
    const l = {
        1: "Requires no target",
        16: "Self cast",
        256: "on Allies",
        4096: "on Enemy"
    }
      , c = (t,e=world)=>{
        if (!e)
            return "?";
        const n = funval(t, e);
        return n % 1 == 0 ? n : n.toFixed(1)
    }
      , d = {
        0: "Melee attack",
        1: "Magic attack",
        2: "Heal",
        4: "Buff",
        5: "Stackable buff",
        6: "Ranged missile",
        7: "Ranged effect",
        9: "Effect"
    };
    let p, u = [], m = {};
    return t.$$set = t=>{
        "skill"in t && n(0, s = t.skill),
        "level"in t && n(1, r = t.level),
        "asItemDescription"in t && n(2, i = t.asItemDescription)
    }
    ,
    t.$$.update = ()=>{
        1075 & t.$$.dirty[0] && (n(5, m = {
            stacks: 1,
            level: r
        }),
        n(5, m.stacks = s.maxStacks ? a ? 1 : s.maxStacks : 1, m),
        n(0, s.stacks = m.stacks, s),
        n(3, u = []),
        s.parent,
        s.statsStatic && (n(4, p = new CoreStats),
        s.statsStatic(m, p)))
    }
    ,
    [s, r, i, u, p, m, o, l, c, d]
}
class Skilldescription extends SvelteComponent {
    constructor(t) {
        super(),
        init(this, t, instance$3, create_fragment$3, safe_not_equal, {
            skill: 0,
            level: 1,
            asItemDescription: 2
        }, [-1, -1])
    }
}
class CoreSkillLogic {
    constructor(t) {
        this.id = t.id,
        this.cd = void 0 !== t.cd ? t.cd : 0,
        this.costMp = t.costMp,
        this.targetMode = t.targetMode || 0,
        this.onCast = t.onCast,
        this.onPermanent = t.onPermanent,
        this.range = t.range || 0,
        this.graceRange = this.range + Math.min(.2 * this.range, 10),
        this.auto = t.auto || !1,
        this.engineOnly = t.engineOnly || !1,
        this.minlevel = t.minlevel || 0,
        this.castLen = t.castLen || 0,
        this.gcd = void 0 !== t.gcd ? t.gcd : 1.5,
        this.custom = t.custom,
        this.skilllevels = Math.min(5, t.skilllevels || 5),
        this.goldValue = t.goldValue || 0,
        this.noReward = t.noReward || !1,
        this.outOfCombat = t.outOfCombat || !1,
        this.pvpBoundsAdd = t.pvpBoundsAdd || 0,
        this.ignoreGcd = t.ignoreGcd || !1,
        this.ignoreIncapacitated = t.ignoreIncapacitated || !1,
        this.disablingBuffs = t.disablingBuffs || [],
        this.hasteAffected = void 0 === t.hasteAffected || t.hasteAffected,
        this.skillpoints = void 0 !== t.skillpoints ? t.skillpoints : 1,
        this.envCast = t.envCast || 0
    }
    can(t, e, n=0, a) {
        if (this.outOfCombat && !t.stats.combatTimer.done(world.time))
            return 11;
        if (void 0 !== this.costMp && t.stats.getResource(7) < this.costMp(e))
            return 5;
        if (1 !== this.targetMode) {
            let e = world.getEntityById(n);
            const s = void 0 === e || e.stats.alive
              , r = void 0 === e ? -1 : t.hostility(e);
            if (4096 === this.targetMode) {
                if ((-1 === r || 0 === r) && s)
                    return 3;
                if (!t.canCombatInteract(e))
                    return 13
            } else if (256 === this.targetMode) {
                if ((-1 === r || 0 !== r) && s)
                    return 4
            } else if (16 === this.targetMode)
                e = t;
            else if (17 === this.targetMode && (void 0 === e || e === t))
                return 3;
            if (void 0 !== e && !e.stats.alive)
                return 10;
            if (e && n !== t.id && e !== t && this.range > 0 && !t.combatRangeCheck(e, a ? this.range : this.graceRange))
                return 6
        }
        return this.disablingBuffs.some(e=>t.buffs.tags.get(e).size > 0) ? 12 : 0
    }
}
class SkillLogic extends CoreSkillLogic {
    constructor(t) {
        super(t),
        this.fx = t.fx || {},
        this.autoSkillbar = !1 !== t.autoSkillBar
    }
}
const passiveBuff = (t,e,n,a)=>({
    id: t,
    minlevel: n,
    engineOnly: !1,
    cd: 0,
    custom: a,
    autoSkillBar: !1,
    onPermanent: (t,n)=>({
        id: e,
        mode: 4,
        caster: t.id,
        target: t.id,
        duration: -1,
        stacks: 1,
        level: n
    })
})
  , activePartyBuff = (t,e,n,a,s,r,i,o)=>({
    id: t,
    targetMode: 16,
    minlevel: n,
    cd: s,
    costMp: i,
    fx: o,
    onCast: (t,n,s)=>({
        id: e,
        mode: 4,
        stacks: 1,
        duration: a,
        caster: t.id,
        target: t.id,
        aoe: {
            faction: !0,
            limit: r,
            circleRadius: 30,
            circleHeight: 20
        },
        level: n
    })
})
  , singleTargetBuff = (t,e,n,a,s,r,i,o=5,l)=>({
    id: t,
    targetMode: 256,
    range: 30,
    minlevel: n,
    cd: s,
    castLen: a,
    costMp: i,
    fx: l,
    onCast: (t,n,a)=>({
        id: e,
        mode: o,
        stacks: 1,
        caster: t.id,
        target: a,
        refresh: !0,
        duration: r,
        level: n
    })
})
  , useItem = (t,e,n=0,a=!0,s,r=!1,i=!1,o)=>({
    id: t,
    targetMode: 16,
    cd: e,
    gcd: 0,
    hasteAffected: !1,
    ignoreIncapacitated: r,
    ignoreGcd: !0,
    castLen: n,
    engineOnly: !0,
    outOfCombat: s,
    fx: o
})
  , armorreinforcement = new SkillLogic(passiveBuff(21, 76, 1))
  , blockBuff = new SkillLogic({
    id: 2,
    targetMode: 16,
    minlevel: 5,
    cd: 30,
    gcd: 0,
    costMp: t=>3 + 5 * t,
    fx: {
        animCast: 6
    },
    custom: [[t=>7 + 12 * t, " heal on block"]],
    onCast: (t,e,n)=>({
        id: 58,
        mode: 4,
        stacks: 1,
        duration: 9,
        caster: t.id,
        target: t.id,
        level: e
    })
})
  , stunmin = t=>.7 + .2 * t
  , stunmax = t=>stunmin(t) + 2.4
  , charge = new SkillLogic({
    id: 33,
    targetMode: 17,
    skilllevels: 1,
    minlevel: 11,
    cd: 15,
    range: 30,
    disablingBuffs: [4],
    costMp: t=>12,
    custom: [[stunmin, "s stunned at min range"], [stunmax, "s stunned at max range"]],
    onCast: (t,e,n)=>{}
})
  , courage = new SkillLogic(activePartyBuff(20, 75, 15, 300, 150, 20, t=>8 * t, {
    animCast: 6
}))
  , crescentBleed = new SkillLogic({
    id: 18,
    cd: 0,
    minlevel: 8,
    autoSkillBar: !1,
    fx: {},
    onPermanent: (t,e)=>({
        id: 72,
        mode: 4,
        caster: t.id,
        target: t.id,
        duration: -1,
        stacks: 1,
        level: e
    })
})
  , crescentStrike = new SkillLogic({
    id: 3,
    targetMode: 1,
    minlevel: 3,
    cd: 6,
    costMp: t=>2 + 2 * t,
    fx: {
        animCast: 5,
        effectDirImpact: 9
    },
    onCast: (t,e,n)=>({
        id: 3,
        mode: 0,
        caster: t.id,
        dmg: t.stats.getDamageRoll() * (1 + .18 * e),
        type: 1,
        aoe: {
            faction: !1,
            circleRadius: 2 + 5 * t.size
        }
    })
})
  , enrage = new SkillLogic({
    id: 17,
    targetMode: 16,
    minlevel: 13,
    cd: 50,
    gcd: 0,
    costMp: t=>8 * t,
    fx: {
        animCast: 6
    },
    onCast: (t,e,n)=>({
        id: 71,
        mode: 4,
        stacks: 1,
        duration: 17,
        caster: t.id,
        target: t.id,
        level: e
    })
})
  , relentlessCry = new SkillLogic({
    id: 50,
    targetMode: 1,
    minlevel: 7,
    cd: 30,
    costMp: t=>4 * t,
    fx: {
        animCast: 40
    },
    custom: [[t=>20 + 5 * t, " % missing + 100 HP recovered"]],
    onCast: (t,e,n)=>({
        id: 121,
        mode: 4,
        stacks: 1,
        caster: t.id,
        buffdata: [0],
        sendBuffData: !0,
        duration: 1 + e,
        level: e,
        aoe: {
            faction: !1,
            circleRadius: 8
        }
    })
})
  , slash = new SkillLogic({
    id: 1,
    targetMode: 4096,
    minlevel: 1,
    cd: 1,
    range: 2,
    custom: [[t=>8 * t, "% chance to daze target for 3 seconds"]],
    costMp: t=>1 + t,
    fx: {
        animImpact: 3
    },
    onCast: (t,e,n)=>{
        const a = 5 + t.stats.getDamageRoll() * (.38 + .39 * e);
        return {
            id: 1,
            mode: 0,
            caster: t.id,
            target: n,
            dmg: a,
            type: 1
        }
    }
})
  , aggroAmount = t=>1e4 + 1e4 * t
  , aggroReset = (t,e)=>{
    1 === e.type && (e.aggroValues.forEach((t,n)=>{
        e.aggroValues.set(n, 1e-4 * t)
    }
    ),
    e.addAggro(t.caster, aggroAmount(t.level)),
    e.buffs.buffs.has(122) && add({
        id: 123,
        mode: 5,
        stacks: t.level,
        caster: e.id,
        target: t.caster,
        refresh: !0,
        duration: 60,
        level: 1
    }))
}
  , taunt = new SkillLogic({
    id: 34,
    targetMode: 1,
    minlevel: 6,
    cd: 15,
    costMp: t=>4 * t,
    fx: {
        animCast: 7
    },
    custom: [[aggroAmount, " aggro generation"]],
    onCast: (t,e,n)=>({
        custom: aggroReset,
        id: 88,
        mode: 4,
        stacks: 1,
        caster: t.id,
        duration: 2 + e,
        level: e,
        aoe: {
            faction: !1,
            circleRadius: 10
        }
    })
})
  , temper = new SkillLogic({
    id: 41,
    targetMode: 16,
    minlevel: 25,
    cd: 30,
    skilllevels: 1,
    gcd: 0,
    costMp: t=>3 + 5 * t,
    onCast: (t,e,n)=>{}
})
  , warcry = new SkillLogic(activePartyBuff(19, 74, 18, 300, 150, 20, t=>8 * t, {
    animCast: 6
}))
  , whirlwind = new SkillLogic({
    id: 46,
    targetMode: 1,
    range: 30,
    minlevel: 4,
    cd: 30,
    castLen: 0,
    costMp: t=>10 + 3 * t,
    fx: {
        effectTarget: 106
    },
    onCast: (t,e,n)=>{}
})
  , arcticaura = new SkillLogic(activePartyBuff(22, 77, 17, 300, 120, 20, t=>5 + 10 * t, {
    animCast: 6
}))
  , enchantment = new SkillLogic(singleTargetBuff(24, 79, 15, 1.5, 0, 300, t=>2 + 3 * t, 4, {
    animCast: 9,
    animChannel: 18
}))
  , frostcall = new SkillLogic({
    id: 52,
    targetMode: 1,
    minlevel: 7,
    envCast: 7,
    cd: 6,
    range: 20,
    costMp: t=>3 * t,
    fx: {
        effectMissile: 107,
        effectTarget: 111
    },
    onCast: (t,e,n,a,s,r)=>{}
})
  , frostnova = new SkillLogic({
    id: 14,
    targetMode: 1,
    minlevel: 3,
    cd: 25,
    costMp: t=>4 * t,
    fx: {
        animCast: 31
    },
    onCast: (t,e,n)=>({
        id: 68,
        mode: 4,
        stacks: 1,
        caster: t.id,
        duration: 5.5 + .5 * e,
        level: e,
        aoe: {
            faction: !1,
            circleRadius: 8
        }
    })
})
  , hypothermic = new SkillLogic({
    id: 16,
    targetMode: 16,
    minlevel: 13,
    cd: 45,
    gcd: 0,
    fx: {
        animCast: 6
    },
    onCast: (t,e,n)=>({
        id: 70,
        mode: 4,
        stacks: 1,
        duration: 12,
        caster: t.id,
        target: t.id,
        level: e
    })
})
  , iceblock = new SkillLogic({
    id: 53,
    targetMode: 16,
    minlevel: 9,
    cd: 80,
    gcd: 0,
    ignoreIncapacitated: !0,
    ignoreGcd: !0,
    costMp: t=>5 * t,
    onCast: (t,e,n)=>({
        id: 117,
        mode: 4,
        duration: 5,
        stacks: 1,
        caster: t.id,
        target: t.id,
        level: e
    })
})
  , icebolt = new SkillLogic({
    id: 4,
    targetMode: 4096,
    range: 30,
    minlevel: 1,
    cd: 0,
    castLen: 1.5,
    custom: [[t=>100 + 10 * t, "% frozen buff multiplier"]],
    costMp: t=>1 + 2 * t,
    fx: {
        animCast: 29,
        effectDirImpact: 30,
        animChannel: 30,
        effectMissile: 27
    },
    onCast: (t,e,n)=>({
        id: 4,
        mode: 6,
        speed: 25,
        caster: t.id,
        target: n,
        dmg: 5 + t.stats.getDamageRoll() * (.3 + .32 * e),
        type: 1
    }),
    onPermanent: (t,e,n)=>({
        id: 100,
        mode: 4,
        stacks: 1,
        duration: -1,
        caster: t.id,
        target: t.id,
        level: e
    })
})
  , mageshieldblocks = t=>3 + t
  , iceshield = new SkillLogic({
    id: 23,
    targetMode: 16,
    minlevel: 5,
    cd: 60,
    gcd: 0,
    costMp: t=>5 * t,
    custom: [[mageshieldblocks, " attacks blocked"]],
    fx: {
        animCast: 6
    },
    onCast: (t,e,n)=>({
        id: 78,
        mode: 4,
        stacks: mageshieldblocks(e),
        duration: 60,
        caster: t.id,
        target: t.id,
        level: e
    })
})
  , icicle = new SkillLogic({
    id: 15,
    targetMode: 1,
    range: 30,
    minlevel: 8,
    cd: 8,
    castLen: 1.5,
    costMp: t=>5 + 5 * t,
    fx: {
        animCast: 29,
        animChannel: 30,
        effectDirImpact: 31,
        effectMissile: 28
    },
    onCast: (t,e,n)=>({
        id: 15,
        mode: 6,
        speed: 10,
        timeout: 2.5,
        caster: t.id,
        rot: t.rot,
        dmg: 10 + t.stats.getDamageRoll() * (.51 + .56 * e),
        type: 1,
        aoe: {
            circleRadius: 4 + .5 * e,
            faction: !1,
            onlyOnce: []
        }
    })
})
  , shatterfrost = new SkillLogic({
    id: 51,
    targetMode: 4096,
    range: 30,
    minlevel: 4,
    cd: 10,
    castLen: 2.8,
    costMp: t=>1 + 2 * t,
    fx: {
        animCast: 37,
        effectDirImpact: 119,
        animChannel: 30,
        effectMissile: 118
    },
    onCast: (t,e,n)=>({
        id: 51,
        mode: 6,
        speed: 20,
        caster: t.id,
        target: n,
        dmg: 5 + t.stats.getDamageRoll() * (1.25 + 1.33 * e),
        type: 1,
        noblock: !0
    })
})
  , teleport = new SkillLogic({
    id: 32,
    targetMode: 1,
    skilllevels: 1,
    minlevel: 5,
    gcd: .7,
    cd: 12,
    disablingBuffs: [4],
    costMp: t=>4 * t,
    fx: {
        animCast: 32
    },
    custom: [[()=>12, "m distance"]],
    onCast: (t,e,n)=>{}
})
  , agonize = new SkillLogic({
    id: 37,
    targetMode: 4096,
    range: 30,
    minlevel: 15,
    cd: 40,
    castLen: 2.3,
    costMp: t=>5 + 5 * t,
    fx: {
        animCast: 9,
        effectImpact: 50,
        animChannel: 16
    },
    onCast: (t,e,n)=>({
        id: 90,
        mode: 4,
        stacks: 1,
        caster: t.id,
        target: n,
        duration: 2.4 + 1 * e,
        level: e
    })
})
  , caninehowl = new SkillLogic(activePartyBuff(28, 83, 12, 15, 60, 15, t=>1 + 3 * t, {
    animCast: 6
}))
  , decay = new SkillLogic({
    id: 12,
    targetMode: 4096,
    range: 25,
    minlevel: 1,
    castLen: 0,
    cd: 3,
    costMp: t=>Math.round(1 + 4.5 * t),
    fx: {
        animCast: 10,
        effectMissile: 48
    },
    onCast: (t,e,n)=>({
        id: 12,
        mode: 6,
        dmg: 5 + t.stats.getDamageRoll() * (.03 + .13 * e),
        type: 1,
        speed: 15,
        caster: t.id,
        target: n,
        level: e
    })
})
  , healingtotem = new SkillLogic({
    id: 30,
    targetMode: 1,
    range: 30,
    minlevel: 18,
    cd: 60,
    castLen: 2.3,
    costMp: t=>10 + 8 * t,
    fx: {
        effectImpact: 70,
        animCast: 14,
        animChannel: 15,
        effectMissile: 69
    },
    onCast: (t,e,n)=>({
        id: 30,
        mode: 6,
        speed: 0,
        timeout: 30,
        caster: t.id,
        rot: t.rot,
        interval: new Timer(0,2),
        heal: t.stats.getDamageRoll() * (.08 + .05 * e),
        type: 1,
        aoe: {
            circleRadius: 30,
            circleHeight: 30,
            faction: !0,
            limit: 15
        }
    })
})
  , mana = new SkillLogic(activePartyBuff(13, 67, 6, 15, 90, 15, void 0, {
    animCast: 22
}))
  , mend = new SkillLogic({
    id: 6,
    targetMode: 256,
    range: 30,
    minlevel: 8,
    cd: 0,
    castLen: 1.7,
    costMp: t=>4 + 4 * t,
    fx: {
        animCast: 11,
        effectImpact: 36,
        animChannel: 12
    },
    onCast: (t,e,n)=>({
        id: 6,
        mode: 2,
        caster: t.id,
        target: n,
        heal: 15 + t.stats.getDamageRoll() * (.2 + .18 * e)
    })
})
  , mimirscleanse = new SkillLogic({
    id: 47,
    targetMode: 256,
    range: 30,
    minlevel: 14,
    cd: 12,
    castLen: 0,
    costMp: t=>4 + 4 * t,
    fx: {
        animCast: 9,
        effectTarget: 112
    },
    custom: [[t=>t, " effects removed"]],
    onCast: (t,e,n)=>{
        let a = 0;
        return {
            id: 47,
            mode: 2,
            caster: t.id,
            target: n,
            heal: (1 + a) * (15 + .25 * t.stats.getDamageRoll())
        }
    }
})
  , plaguespreader = new SkillLogic(passiveBuff(43, 106, 3, [[t=>1 + 2 * t, "% haste per stack"], [t=>1 + 2 * t, " jumps"]]))
  , revitalize = new SkillLogic(singleTargetBuff(7, 59, 3, 0, 0, 12, t=>2 + 2 * t, 5, {
    animCast: 9
}))
  , soulharvest = new SkillLogic({
    id: 42,
    targetMode: 1,
    minlevel: 8,
    cd: 8,
    castLen: 0,
    range: 25,
    custom: [[t=>Math.round(1.3 * t), " mana gained per soul"], [t=>2 * t, " extended Decay duration"]],
    costMp: t=>1 + 3 * t,
    fx: {
        animCast: 13,
        effectImpact: 46
    },
    onCast: (t,e,n)=>{
        const a = 0;
        return {
            id: 42,
            mode: 1,
            caster: t.id,
            target: a,
            type: 1,
            dmg: 4 + t.stats.getDamageRoll() * (.25 + .4 * e),
            level: e
        }
    }
})
  , soulharvestReturn = new SkillLogic({
    id: 105,
    engineOnly: !0,
    cd: 0,
    fx: {
        effectImpact: 47,
        effectMissile: 45
    }
})
  , spiritanimal = new SkillLogic({
    id: 36,
    targetMode: 16,
    minlevel: 10,
    cd: 30,
    gcd: 0,
    costMp: t=>8 + 2 * t,
    onCast: (t,e,n)=>({
        id: 89,
        mode: 4,
        stacks: 1,
        duration: 5 + 5 * e,
        caster: t.id,
        target: t.id,
        level: e
    })
})
  , summon = new SkillLogic({
    id: 35,
    targetMode: 1,
    skilllevels: 1,
    minlevel: 5,
    cd: 120,
    skillpoints: 0,
    castLen: 5,
    outOfCombat: !0,
    hasteAffected: !1,
    pvpBoundsAdd: 5,
    costMp: t=>20 + 5 * t,
    fx: {
        animCast: 20,
        animChannel: 21
    },
    onCast: (t,e,n)=>{}
})
  , blindingshot = new SkillLogic({
    id: 49,
    targetMode: 4096,
    range: 30,
    minlevel: 13,
    cd: 25,
    costMp: t=>1 + 1 * t,
    fx: {
        animCast: 38,
        effectMissile: 123,
        animChannel: 28
    },
    onCast: (t,e,n)=>({
        id: 49,
        buffid: 119,
        mode: 7,
        speed: 60,
        caster: t.id,
        level: e,
        stacks: 1,
        duration: 1 + 2 * e,
        refresh: !0,
        target: n
    })
})
  , boneshot = new SkillLogic({
    id: 54,
    targetMode: 4096,
    range: 30,
    minlevel: 8,
    cd: 10,
    castLen: 2.8,
    costMp: t=>8 + 3 * t,
    fx: {
        animCast: 39,
        effectDirImpact: 121,
        animChannel: 25,
        effectMissile: 114
    },
    onCast: (t,e,n)=>({
        id: 54,
        mode: 6,
        speed: 60,
        caster: t.id,
        target: n,
        dmg: 5 + t.stats.getDamageRoll() * (1.25 + 1.33 * e),
        type: 1,
        noblock: !0
    })
})
  , cranialpunctures = new SkillLogic(passiveBuff(26, 81, 15))
  , invigorate = new SkillLogic({
    id: 11,
    targetMode: 16,
    minlevel: 7,
    cd: 50,
    gcd: 0,
    fx: {
        animCast: 6
    },
    custom: [[t=>3 + 5 * t, "% of max mp recovered"]],
    onCast: (t,e,n)=>({
        id: 65,
        mode: 4,
        stacks: 1,
        duration: 17,
        caster: t.id,
        target: t.id,
        level: e
    })
})
  , pathfinding = new SkillLogic(activePartyBuff(27, 82, 12, 10, 100, 20, t=>5 + 7 * t, {
    animCast: 6
}))
  , poisonarrows = new SkillLogic({
    id: 29,
    cd: 0,
    minlevel: 9,
    autoSkillBar: !1,
    onPermanent: (t,e)=>({
        id: 84,
        mode: 4,
        caster: t.id,
        target: t.id,
        duration: -1,
        stacks: 1,
        level: e
    })
})
  , preciseShot = new SkillLogic({
    id: 9,
    targetMode: 4096,
    range: 30,
    minlevel: 3,
    cd: 6,
    castLen: 1.7,
    costMp: t=>2 + 3 * t,
    fx: {
        animCast: 24,
        effectDirImpact: 85,
        animChannel: 25,
        effectMissile: 33
    },
    onCast: (t,e,n)=>({
        id: 9,
        mode: 6,
        speed: 120,
        caster: t.id,
        target: n,
        dmg: 5 + t.stats.getDamageRoll() * (.48 + .41 * e),
        type: 1
    })
})
  , serpentArrows = new SkillLogic({
    id: 10,
    targetMode: 16,
    minlevel: 5,
    cd: 0,
    autoSkillBar: !1,
    onPermanent: (t,e,n)=>({
        id: 64,
        mode: 4,
        stacks: 1,
        duration: -1,
        caster: t.id,
        target: t.id,
        level: e
    })
})
  , snipe = new SkillLogic({
    id: 38,
    targetMode: 16,
    minlevel: 5,
    skilllevels: 1,
    cd: 10,
    gcd: 0,
    disablingBuffs: [4],
    costMp: t=>6,
    fx: {
        animCast: 23
    },
    onCast: (t,e,n)=>!0
})
  , swiftshot = new SkillLogic({
    id: 31,
    targetMode: 4096,
    range: 30,
    minlevel: 1,
    cd: 0,
    castLen: 1.5,
    costMp: t=>1 + 1 * t,
    fx: {
        animCast: 27,
        effectDirImpact: 84,
        effectMissile: 34,
        animChannel: 28
    },
    onCast: (t,e,n)=>({
        id: 31,
        mode: 6,
        speed: 60,
        caster: t.id,
        target: n,
        dmg: 5 + t.stats.getDamageRoll() * (.24 + .25 * e),
        type: 1
    })
})
  , temporaldilation = new SkillLogic(activePartyBuff(25, 80, 18, 300, 120, 20, t=>5 + 5 * t, {
    animCast: 6
}))
  , vampiricarrow = new SkillLogic({
    id: 48,
    targetMode: 4096,
    range: 30,
    minlevel: 6,
    cd: 15,
    ignoreGcd: !0,
    costMp: t=>1 + 1 * t,
    fx: {
        animCast: 36,
        effectDirImpact: 115,
        effectMissile: 113,
        animChannel: 28
    },
    custom: [[t=>120 * t, " HP recovered"]],
    onCast: (t,e,n)=>({
        id: 48,
        mode: 6,
        speed: 80,
        caster: t.id,
        target: n,
        dmg: 5 + t.stats.getDamageRoll() * (.28 + .28 * e),
        type: 1
    })
})
  , vampiricarrowReturn = new SkillLogic({
    id: 106,
    engineOnly: !0,
    cd: 0,
    fx: {
        effectMissile: 116,
        effectImpact: 117
    }
})
  , volley = new SkillLogic({
    id: 45,
    targetMode: 1,
    range: 30,
    minlevel: 4,
    cd: 26,
    castLen: 0,
    costMp: t=>18 + 3 * t,
    fx: {
        effectDirImpact: 11,
        effectMissile: 103
    },
    onCast: (t,e,n)=>{}
})
  , pvpCharm = {
    medalValue: 1e3,
    goldValue: 5e4,
    buyElo: 1600,
    quality: 90,
    level: 45,
    gs: 30,
    uniqueEquipped: !0
}
  , charms$1 = [{
    id: 0,
    custom: ["Use: Removes all movement limiting effects."],
    useCd: 60,
    incap: !0,
    animCast: 45,
    use: (t,e,n,a)=>{}
}, {
    id: 1,
    custom: ["Use: Protects you against 30% of incoming damage for 10 seconds."],
    useCd: 60,
    animCast: 6,
    incap: !1,
    use: (t,e,n,a)=>{}
}, {
    id: 2,
    custom: ["Use: Increases your damage by 20% for 10 seconds."],
    useCd: 80,
    incap: !1,
    animCast: 6,
    use: (t,e,n,a)=>{}
}, {
    id: 3,
    custom: ["Use: Speeds up your movement by 45 for 8 seconds."],
    useCd: 50,
    incap: !1,
    animCast: 6,
    use: (t,e,n,a)=>{}
}, {
    id: 4,
    custom: ["Use: Attacks made against you grant 20 MP (up to 200) for 20 seconds."],
    useCd: 60,
    incap: !1,
    animCast: 6,
    use: (t,e,n,a)=>{}
}]
  , generate$5 = t=>{
    charms$1.forEach((e,n)=>{
        t["charm" + e.id] = {
            ...pvpCharm,
            ...e,
            type: "charm",
            tier: e.id,
            useSkill: 107 + n
        }
    }
    )
}
  , potion = new SkillLogic(useItem(100, 30, 0, !0, !0, !1, !1, {
    animCast: 17
}))
  , book = new SkillLogic(useItem(101, 1.5, 0, !0, !1, !1, !1))
  , useGeneric = new SkillLogic(useItem(104, 1.5, 0, !1, !1, !1, !1))
  , container = new SkillLogic(useItem(103, 1.5, 3, !0, !1, !1, !1, {
    animCast: 19,
    animChannel: 18
}))
  , activatemount = new SkillLogic(useItem(102, 1.5, 1.5, !1, !0, !1, !1, {
    animCast: 9,
    animChannel: 18
}))
  , charms = charms$1.map((t,e)=>new SkillLogic(useItem(107 + e, t.useCd, 0, !1, !1, t.incap, !0, {
    animCast: t.animCast
}))).reduce((t,e)=>({
    ...t,
    ["charm" + e.id]: e
}), {})
  , arrow = new SkillLogic({
    id: 5,
    targetMode: 4096,
    range: 30,
    engineOnly: !0,
    auto: !0,
    cd: t=>100 / t.stats.getStat(17),
    fx: {
        animCast: 26,
        effectDirImpact: 11,
        effectMissile: 32
    },
    onCast: (t,e,n)=>({
        id: 5,
        mode: 6,
        speed: 45,
        caster: t.id,
        target: n,
        dmg: t.stats.getDamageRoll(),
        type: 0
    })
})
  , boss_bigaoe = new SkillLogic({
    id: 56,
    targetMode: 1,
    range: 50,
    cd: 10,
    engineOnly: !0,
    castLen: 2,
    fx: {
        animCast: 41,
        animChannel: 42
    }
})
  , boss_flamepits = new SkillLogic({
    id: 44,
    targetMode: 1,
    range: 50,
    minlevel: 3,
    cd: 5,
    engineOnly: !0,
    castLen: 1.5,
    costMp: t=>4 * t
})
  , boss_puddledot = new SkillLogic({
    id: 55,
    targetMode: 1,
    range: 50,
    minlevel: 3,
    cd: 20,
    engineOnly: !0,
    castLen: 2,
    fx: {
        effectMissile: 131,
        animCast: 43,
        animChannel: 42
    }
})
  , conjurer_obeliskport = new SkillLogic({
    id: 57,
    targetMode: 1,
    range: 10,
    cd: 2,
    engineOnly: !0,
    hasteAffected: !1,
    castLen: 30,
    fx: {
        animCast: 9,
        animChannel: 44
    }
})
  , melee = new SkillLogic({
    id: 0,
    targetMode: 4096,
    engineOnly: !0,
    auto: !0,
    range: 2,
    cd: t=>100 / t.stats.getStat(17),
    fx: {
        animImpact: 4
    },
    onCast: (t,e,n)=>({
        id: 0,
        mode: 0,
        caster: t.id,
        target: n,
        dmg: t.stats.getDamageRoll(),
        type: 0
    })
})
  , mount = new SkillLogic({
    id: 39,
    engineOnly: !1,
    skilllevels: 1,
    minlevel: 30,
    cd: 0,
    goldValue: 25e3,
    skillpoints: 0,
    noReward: !0,
    autoSkillBar: !1
})
  , general = {
    ...charms,
    conjurer_obeliskport: conjurer_obeliskport,
    boss_bigaoe: boss_bigaoe,
    boss_puddledot: boss_puddledot,
    recall: new SkillLogic({
        id: 40,
        targetMode: 1,
        engineOnly: !0,
        cd: 300,
        castLen: 5,
        outOfCombat: !0,
        hasteAffected: !1,
        costMp: t=>20 + 5 * t,
        fx: {
            animCast: 9,
            animChannel: 8
        },
        onCast: (t,e,n)=>{}
    }),
    arrow: arrow,
    melee: melee,
    potion: potion,
    book: book,
    specialization: new SkillLogic({
        id: 8,
        engineOnly: !0,
        cd: 0,
        onPermanent: (t,e)=>({
            id: t.class + 60,
            mode: 4,
            caster: t.id,
            target: t.id,
            duration: -1,
            stacks: 1,
            level: e
        })
    }),
    mount: mount,
    activatemount: activatemount,
    container: container,
    boss_flamepits: boss_flamepits,
    useGeneric: useGeneric
}
  , warrior = {
    relentlessCry: relentlessCry,
    whirlwind: whirlwind,
    temper: temper,
    taunt: taunt,
    charge: charge,
    warcry: warcry,
    courage: courage,
    armorreinforcement: armorreinforcement,
    enrage: enrage,
    slash: slash,
    blockBuff: blockBuff,
    crescentStrike: crescentStrike,
    crescentBleed: crescentBleed
}
  , mage = {
    frostcall: frostcall,
    iceblock: iceblock,
    shatterfrost: shatterfrost,
    teleport: teleport,
    enchantment: enchantment,
    arcticaura: arcticaura,
    iceshield: iceshield,
    hypothermic: hypothermic,
    frostnova: frostnova,
    icebolt: icebolt,
    icicle: icicle
}
  , archer = {
    vampiricarrowReturn: vampiricarrowReturn,
    boneshot: boneshot,
    blindingshot: blindingshot,
    vampiricarrow: vampiricarrow,
    volley: volley,
    snipe: snipe,
    poisonarrows: poisonarrows,
    temporaldilation: temporaldilation,
    pathfinding: pathfinding,
    preciseShot: preciseShot,
    serpentArrows: serpentArrows,
    invigorate: invigorate,
    swiftshot: swiftshot,
    cranialpunctures: cranialpunctures
}
  , shaman = {
    mimirscleanse: mimirscleanse,
    soulharvestReturn: soulharvestReturn,
    plaguespreader: plaguespreader,
    soulharvest: soulharvest,
    agonize: agonize,
    caninehowl: caninehowl,
    mana: mana,
    mend: mend,
    revitalize: revitalize,
    decay: decay,
    healingtotem: healingtotem,
    summon: summon,
    spiritanimal: spiritanimal
}
  , list = new Map;
function create_fragment$2(t) {
    let e, n, a, s, r, i;
    return {
        c() {
            e = element("span"),
            n = element("img"),
            s = element("span"),
            r = text(t[0]),
            attr(n, "class", "svgicon texticon"),
            n.src !== (a = "/assets/ui/icons/gem.svg?v=5700123") && attr(n, "src", a),
            attr(s, "class", i = !t[1] || t[0] < t[2] ? "textprimary" : "textred")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n),
            append(e, s),
            append(s, r)
        },
        p(t, [e]) {
            1 & e && set_data(r, t[0]),
            7 & e && i !== (i = !t[1] || t[0] < t[2] ? "textprimary" : "textred") && attr(s, "class", i)
        },
        i: noop,
        o: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function instance$2(t, e, n) {
    let a;
    component_subscribe(t, inventoryStorepoints, t=>n(2, a = t));
    let {amount: s} = e
      , {isPrice: r=!1} = e;
    return t.$$set = t=>{
        "amount"in t && n(0, s = t.amount),
        "isPrice"in t && n(1, r = t.isPrice)
    }
    ,
    [s, r, a]
}
[warrior, mage, archer, shaman, general].forEach((t,e)=>{
    for (const n in t)
        e <= 3 && (t[n].class = e),
        list.set(t[n].id, t[n])
}
),
list.set(59, new SkillLogic({
    id: 59,
    engineOnly: !0
}));
class Storepoints extends SvelteComponent {
    constructor(t) {
        super(),
        init(this, t, instance$2, create_fragment$2, not_equal, {
            amount: 0,
            isPrice: 1
        })
    }
}
function get_each_context$1(t, e, n) {
    const a = t.slice();
    return a[10] = e[n],
    a
}
function get_each_context_1$1(t, e, n) {
    const a = t.slice();
    return a[13] = e[n],
    a
}
function get_each_context_2$1(t, e, n) {
    const a = t.slice();
    return a[13] = e[n],
    a
}
function get_each_context_3$1(t, e, n) {
    const a = t.slice();
    return a[18] = e[n],
    a
}
function get_each_context_4$1(t, e, n) {
    const a = t.slice();
    return a[10] = e[n],
    a
}
function create_if_block_17(t) {
    let e, n, a, s, r = t[0].gs + "";
    return {
        c() {
            e = element("span"),
            n = text("GS: "),
            a = text(r),
            s = space(),
            attr(e, "class", "textgreen")
        },
        m(t, r) {
            insert(t, e, r),
            append(e, n),
            append(e, a),
            insert(t, s, r)
        },
        p(t, e) {
            1 & e && r !== (r = t[0].gs + "") && set_data(a, r)
        },
        d(t) {
            t && detach(e),
            t && detach(s)
        }
    }
}
function create_if_block_16(t) {
    let e, n, a, s = t[0].dbid + "";
    return {
        c() {
            e = element("span"),
            n = text("ID: "),
            a = text(s),
            attr(e, "class", "textgrey")
        },
        m(t, s) {
            insert(t, e, s),
            append(e, n),
            append(e, a)
        },
        p(t, e) {
            1 & e && s !== (s = t[0].dbid + "") && set_data(a, s)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_else_block_3(t) {
    let e, n, a, s, r, i, o = "bonus" == t[10][1].type ? "+ " : "", l = stat(t[10][0], t[10][1].value) + "", c = loc.ui.stats.array[t[10][0]] + "", d = "bonus" == t[10][1].type && t[4] && create_if_block_15(t);
    return {
        c() {
            e = element("div"),
            n = text(o),
            a = text(l),
            s = space(),
            r = text(c),
            i = space(),
            d && d.c(),
            attr(e, "class", "text" + quality(t[10][1].qual)[0] + " svelte-e3ao5j")
        },
        m(t, o) {
            insert(t, e, o),
            append(e, n),
            append(e, a),
            append(e, s),
            append(e, r),
            append(e, i),
            d && d.m(e, null)
        },
        p(t, n) {
            "bonus" == t[10][1].type && t[4] ? d ? d.p(t, n) : (d = create_if_block_15(t),
            d.c(),
            d.m(e, null)) : d && (d.d(1),
            d = null)
        },
        d(t) {
            t && detach(e),
            d && d.d()
        }
    }
}
function create_if_block_14(t) {
    let e, n, a, s, r, i, o, l, c, d, p, u, m = t[0].stats.get(10).value + "", f = t[0].stats.get(11).value + "", g = loc.ui.stats.misc.damage + "";
    return {
        c() {
            e = element("div"),
            n = element("span"),
            a = text(m),
            r = text(" - "),
            i = element("span"),
            o = text(f),
            c = space(),
            d = element("span"),
            p = text(g),
            attr(n, "class", s = "text" + quality(t[0].stats.get(10).qual)[0] + " svelte-e3ao5j"),
            attr(i, "class", l = "text" + quality(t[0].stats.get(11).qual)[0] + " svelte-e3ao5j"),
            attr(d, "class", u = "text" + quality(Math.min(t[0].stats.get(10).qual, t[0].stats.get(11).qual))[0] + " svelte-e3ao5j")
        },
        m(t, s) {
            insert(t, e, s),
            append(e, n),
            append(n, a),
            append(e, r),
            append(e, i),
            append(i, o),
            append(e, c),
            append(e, d),
            append(d, p)
        },
        p(t, e) {
            1 & e && m !== (m = t[0].stats.get(10).value + "") && set_data(a, m),
            1 & e && s !== (s = "text" + quality(t[0].stats.get(10).qual)[0] + " svelte-e3ao5j") && attr(n, "class", s),
            1 & e && f !== (f = t[0].stats.get(11).value + "") && set_data(o, f),
            1 & e && l !== (l = "text" + quality(t[0].stats.get(11).qual)[0] + " svelte-e3ao5j") && attr(i, "class", l),
            1 & e && u !== (u = "text" + quality(Math.min(t[0].stats.get(10).qual, t[0].stats.get(11).qual))[0] + " svelte-e3ao5j") && attr(d, "class", u)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_15(t) {
    let e, n, a, s = Math.round(t[10][1].qual) + "";
    return {
        c() {
            e = element("span"),
            n = text(s),
            a = text("%")
        },
        m(t, s) {
            insert(t, e, s),
            append(e, n),
            append(e, a)
        },
        p: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function create_each_block_4$1(t) {
    let e, n;
    function a(t, n) {
        return (null == e || 1 & n) && (e = !(10 != t[10][0] || !t[0].stats.has(11))),
        e ? create_if_block_14 : create_else_block_3
    }
    let s = a(t, -1)
      , r = s(t);
    return {
        c() {
            r.c(),
            n = empty()
        },
        m(t, e) {
            r.m(t, e),
            insert(t, n, e)
        },
        p(t, e) {
            s === (s = a(t, e)) && r ? r.p(t, e) : (r.d(1),
            r = s(t),
            r && (r.c(),
            r.m(n.parentNode, n)))
        },
        d(t) {
            r.d(t),
            t && detach(n)
        }
    }
}
function create_if_block_13(t) {
    let e, n = t[0].logic.custom, a = [];
    for (let e = 0; e < n.length; e += 1)
        a[e] = create_each_block_3$1(get_each_context_3$1(t, n, e));
    return {
        c() {
            for (let t = 0; t < a.length; t += 1)
                a[t].c();
            e = empty()
        },
        m(t, n) {
            for (let e = 0; e < a.length; e += 1)
                a[e].m(t, n);
            insert(t, e, n)
        },
        p(t, s) {
            if (1 & s) {
                let r;
                for (n = t[0].logic.custom,
                r = 0; r < n.length; r += 1) {
                    const i = get_each_context_3$1(t, n, r);
                    a[r] ? a[r].p(i, s) : (a[r] = create_each_block_3$1(i),
                    a[r].c(),
                    a[r].m(e.parentNode, e))
                }
                for (; r < a.length; r += 1)
                    a[r].d(1);
                a.length = n.length
            }
        },
        d(t) {
            destroy_each(a, t),
            t && detach(e)
        }
    }
}
function create_each_block_3$1(t) {
    let e, n, a = t[18] + "";
    return {
        c() {
            e = element("span"),
            n = text(a),
            attr(e, "class", "textgreen")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p(t, e) {
            1 & e && a !== (a = t[18] + "") && set_data(n, a)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_each_block_2$1(t) {
    let e, n, a, s = t[13][0] + "";
    return {
        c() {
            e = element("div"),
            n = text(s),
            attr(e, "class", a = t[13][1] ? "textgreen" : "textred")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p(t, r) {
            1 & r && s !== (s = t[13][0] + "") && set_data(n, s),
            1 & r && a !== (a = t[13][1] ? "textgreen" : "textred") && attr(e, "class", a)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_else_block_2(t) {
    let e, n, a, s = t[0].logic.bindOnPurchase && create_if_block_12(t), r = t[0].logic.bindOnUse && create_if_block_11(t), i = t[0].logic.bindOnMerchant && create_if_block_10(t);
    return {
        c() {
            s && s.c(),
            e = empty(),
            r && r.c(),
            n = empty(),
            i && i.c(),
            a = empty()
        },
        m(t, o) {
            s && s.m(t, o),
            insert(t, e, o),
            r && r.m(t, o),
            insert(t, n, o),
            i && i.m(t, o),
            insert(t, a, o)
        },
        p(t, o) {
            t[0].logic.bindOnPurchase ? s ? s.p(t, o) : (s = create_if_block_12(t),
            s.c(),
            s.m(e.parentNode, e)) : s && (s.d(1),
            s = null),
            t[0].logic.bindOnUse ? r ? r.p(t, o) : (r = create_if_block_11(t),
            r.c(),
            r.m(n.parentNode, n)) : r && (r.d(1),
            r = null),
            t[0].logic.bindOnMerchant ? i ? i.p(t, o) : (i = create_if_block_10(t),
            i.c(),
            i.m(a.parentNode, a)) : i && (i.d(1),
            i = null)
        },
        d(t) {
            s && s.d(t),
            t && detach(e),
            r && r.d(t),
            t && detach(n),
            i && i.d(t),
            t && detach(a)
        }
    }
}
function create_if_block_9(t) {
    let e, n, a = loc.ui.inventory.bindlevel[t[0].bound] + "";
    return {
        c() {
            e = element("div"),
            n = text(a),
            attr(e, "class", "textgreen")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p(t, e) {
            1 & e && a !== (a = loc.ui.inventory.bindlevel[t[0].bound] + "") && set_data(n, a)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_12(t) {
    let e, n, a, s = loc.ui.inventory.bindlevel[t[0].logic.bindOnPurchase] + "";
    return {
        c() {
            e = element("div"),
            n = text(s),
            a = text(" on purchase"),
            attr(e, "class", "textcyan")
        },
        m(t, s) {
            insert(t, e, s),
            append(e, n),
            append(e, a)
        },
        p(t, e) {
            1 & e && s !== (s = loc.ui.inventory.bindlevel[t[0].logic.bindOnPurchase] + "") && set_data(n, s)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_11(t) {
    let e, n, a, s = loc.ui.inventory.bindlevel[t[0].logic.bindOnUse] + "";
    return {
        c() {
            e = element("div"),
            n = text(s),
            a = text(" on use"),
            attr(e, "class", "textcyan")
        },
        m(t, s) {
            insert(t, e, s),
            append(e, n),
            append(e, a)
        },
        p(t, e) {
            1 & e && s !== (s = loc.ui.inventory.bindlevel[t[0].logic.bindOnUse] + "") && set_data(n, s)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_10(t) {
    let e, n, a, s = loc.ui.inventory.bindlevel[t[0].logic.bindOnMerchant] + "";
    return {
        c() {
            e = element("div"),
            n = text(s),
            a = text(" on merchant sale"),
            attr(e, "class", "textcyan")
        },
        m(t, s) {
            insert(t, e, s),
            append(e, n),
            append(e, a)
        },
        p(t, e) {
            1 & e && s !== (s = loc.ui.inventory.bindlevel[t[0].logic.bindOnMerchant] + "") && set_data(n, s)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_4(t) {
    let e, n, a, s, r, i = t[0].medalValue() > 0 && t[1], o = t[0].storeValue() > 0 && t[1], l = !(t[0].storeValue() > 0 && t[1]) && t[0].canBeSold(), c = t[1] && create_if_block_8(t), d = i && create_if_block_7(t), p = o && create_if_block_6(t), u = l && create_if_block_5(t);
    return {
        c() {
            e = element("div"),
            c && c.c(),
            n = empty(),
            d && d.c(),
            a = empty(),
            p && p.c(),
            s = empty(),
            u && u.c(),
            attr(e, "class", "panel value pack svelte-e3ao5j")
        },
        m(t, i) {
            insert(t, e, i),
            c && c.m(e, null),
            append(e, n),
            d && d.m(e, null),
            append(e, a),
            p && p.m(e, null),
            append(e, s),
            u && u.m(e, null),
            r = !0
        },
        p(t, r) {
            t[1] ? c ? c.p(t, r) : (c = create_if_block_8(t),
            c.c(),
            c.m(e, n)) : c && (c.d(1),
            c = null),
            3 & r && (i = t[0].medalValue() > 0 && t[1]),
            i ? d ? (d.p(t, r),
            3 & r && transition_in(d, 1)) : (d = create_if_block_7(t),
            d.c(),
            transition_in(d, 1),
            d.m(e, a)) : d && (group_outros(),
            transition_out(d, 1, 1, ()=>{
                d = null
            }
            ),
            check_outros()),
            3 & r && (o = t[0].storeValue() > 0 && t[1]),
            o ? p ? (p.p(t, r),
            3 & r && transition_in(p, 1)) : (p = create_if_block_6(t),
            p.c(),
            transition_in(p, 1),
            p.m(e, s)) : p && (group_outros(),
            transition_out(p, 1, 1, ()=>{
                p = null
            }
            ),
            check_outros()),
            3 & r && (l = !(t[0].storeValue() > 0 && t[1]) && t[0].canBeSold()),
            l ? u ? (u.p(t, r),
            3 & r && transition_in(u, 1)) : (u = create_if_block_5(t),
            u.c(),
            transition_in(u, 1),
            u.m(e, null)) : u && (group_outros(),
            transition_out(u, 1, 1, ()=>{
                u = null
            }
            ),
            check_outros())
        },
        i(t) {
            r || (transition_in(d),
            transition_in(p),
            transition_in(u),
            r = !0)
        },
        o(t) {
            transition_out(d),
            transition_out(p),
            transition_out(u),
            r = !1
        },
        d(t) {
            t && detach(e),
            c && c.d(),
            d && d.d(),
            p && p.d(),
            u && u.d()
        }
    }
}
function create_if_block_8(t) {
    let e, n = t[0].buyReasons(world), a = [];
    for (let e = 0; e < n.length; e += 1)
        a[e] = create_each_block_1$1(get_each_context_1$1(t, n, e));
    return {
        c() {
            for (let t = 0; t < a.length; t += 1)
                a[t].c();
            e = empty()
        },
        m(t, n) {
            for (let e = 0; e < a.length; e += 1)
                a[e].m(t, n);
            insert(t, e, n)
        },
        p(t, s) {
            if (1 & s) {
                let r;
                for (n = t[0].buyReasons(world),
                r = 0; r < n.length; r += 1) {
                    const i = get_each_context_1$1(t, n, r);
                    a[r] ? a[r].p(i, s) : (a[r] = create_each_block_1$1(i),
                    a[r].c(),
                    a[r].m(e.parentNode, e))
                }
                for (; r < a.length; r += 1)
                    a[r].d(1);
                a.length = n.length
            }
        },
        d(t) {
            destroy_each(a, t),
            t && detach(e)
        }
    }
}
function create_each_block_1$1(t) {
    let e, n, a = t[13][0] + "";
    return {
        c() {
            e = element("div"),
            attr(e, "class", n = t[13][1] ? "textgreen" : "textred")
        },
        m(t, n) {
            insert(t, e, n),
            e.innerHTML = a
        },
        p(t, s) {
            1 & s && a !== (a = t[13][0] + "") && (e.innerHTML = a),
            1 & s && n !== (n = t[13][1] ? "textgreen" : "textred") && attr(e, "class", n)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_7(t) {
    let e, n, a;
    return n = new Medals({
        props: {
            amount: t[0].medalValue(),
            isPrice: !0
        }
    }),
    {
        c() {
            e = element("div"),
            create_component(n.$$.fragment)
        },
        m(t, s) {
            insert(t, e, s),
            mount_component(n, e, null),
            a = !0
        },
        p(t, e) {
            const a = {};
            1 & e && (a.amount = t[0].medalValue()),
            n.$set(a)
        },
        i(t) {
            a || (transition_in(n.$$.fragment, t),
            a = !0)
        },
        o(t) {
            transition_out(n.$$.fragment, t),
            a = !1
        },
        d(t) {
            t && detach(e),
            destroy_component(n)
        }
    }
}
function create_if_block_6(t) {
    let e, n, a;
    return n = new Storepoints({
        props: {
            amount: t[0].storeValue(),
            isPrice: !0
        }
    }),
    {
        c() {
            e = element("div"),
            create_component(n.$$.fragment)
        },
        m(t, s) {
            insert(t, e, s),
            mount_component(n, e, null),
            a = !0
        },
        p(t, e) {
            const a = {};
            1 & e && (a.amount = t[0].storeValue()),
            n.$set(a)
        },
        i(t) {
            a || (transition_in(n.$$.fragment, t),
            a = !0)
        },
        o(t) {
            transition_out(n.$$.fragment, t),
            a = !1
        },
        d(t) {
            t && detach(e),
            destroy_component(n)
        }
    }
}
function create_if_block_5(t) {
    let e, n, a;
    return n = new Gold({
        props: {
            amount: t[0].goldValue(t[1]),
            isPrice: t[1]
        }
    }),
    {
        c() {
            e = element("div"),
            create_component(n.$$.fragment)
        },
        m(t, s) {
            insert(t, e, s),
            mount_component(n, e, null),
            a = !0
        },
        p(t, e) {
            const a = {};
            3 & e && (a.amount = t[0].goldValue(t[1])),
            2 & e && (a.isPrice = t[1]),
            n.$set(a)
        },
        i(t) {
            a || (transition_in(n.$$.fragment, t),
            a = !0)
        },
        o(t) {
            transition_out(n.$$.fragment, t),
            a = !1
        },
        d(t) {
            t && detach(e),
            destroy_component(n)
        }
    }
}
function create_else_block$1(t) {
    let e, n, a, s, r;
    const i = [create_if_block_3, create_else_block_1]
      , o = [];
    function l(t, e) {
        return "book" == t[0].type ? 0 : 1
    }
    e = l(t),
    n = o[e] = i[e](t);
    let c = t[5] && create_if_block_2();
    return {
        c() {
            n.c(),
            a = empty(),
            c && c.c(),
            s = empty()
        },
        m(t, n) {
            o[e].m(t, n),
            insert(t, a, n),
            c && c.m(t, n),
            insert(t, s, n),
            r = !0
        },
        p(t, r) {
            let d = e;
            e = l(t),
            e === d ? o[e].p(t, r) : (group_outros(),
            transition_out(o[d], 1, 1, ()=>{
                o[d] = null
            }
            ),
            check_outros(),
            n = o[e],
            n || (n = o[e] = i[e](t),
            n.c()),
            transition_in(n, 1),
            n.m(a.parentNode, a)),
            t[5] ? c || (c = create_if_block_2(),
            c.c(),
            c.m(s.parentNode, s)) : c && (c.d(1),
            c = null)
        },
        i(t) {
            r || (transition_in(n),
            r = !0)
        },
        o(t) {
            transition_out(n),
            r = !1
        },
        d(t) {
            o[e].d(t),
            t && detach(a),
            c && c.d(t),
            t && detach(s)
        }
    }
}
function create_if_block_1$1(t) {
    let e, n, a = t[3], s = [];
    for (let e = 0; e < a.length; e += 1)
        s[e] = create_each_block$1(get_each_context$1(t, a, e));
    return {
        c() {
            e = element("div"),
            n = element("div"),
            n.textContent = "Equipping this item will have these effects:";
            for (let t = 0; t < s.length; t += 1)
                s[t].c();
            attr(n, "class", "textgrey"),
            attr(e, "class", "pack svelte-e3ao5j")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n);
            for (let t = 0; t < s.length; t += 1)
                s[t].m(e, null)
        },
        p(t, n) {
            if (8 & n) {
                let r;
                for (a = t[3],
                r = 0; r < a.length; r += 1) {
                    const i = get_each_context$1(t, a, r);
                    s[r] ? s[r].p(i, n) : (s[r] = create_each_block$1(i),
                    s[r].c(),
                    s[r].m(e, null))
                }
                for (; r < s.length; r += 1)
                    s[r].d(1);
                s.length = a.length
            }
        },
        i: noop,
        o: noop,
        d(t) {
            t && detach(e),
            destroy_each(s, t)
        }
    }
}
function create_else_block_1(t) {
    let e, n, a = itemDescription(t[0].type, t[0].tier) + "";
    return {
        c() {
            e = element("div"),
            n = text(a),
            attr(e, "class", "pack description svelte-e3ao5j")
        },
        m(t, a) {
            insert(t, e, a),
            append(e, n)
        },
        p(t, e) {
            1 & e && a !== (a = itemDescription(t[0].type, t[0].tier) + "") && set_data(n, a)
        },
        i: noop,
        o: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_3(t) {
    let e, n;
    return e = new Skilldescription({
        props: {
            level: t[0].logic.skilllevel + 1,
            skill: list.get(t[0].logic.skillid),
            asItemDescription: !0
        }
    }),
    {
        c() {
            create_component(e.$$.fragment)
        },
        m(t, a) {
            mount_component(e, t, a),
            n = !0
        },
        p(t, n) {
            const a = {};
            1 & n && (a.level = t[0].logic.skilllevel + 1),
            1 & n && (a.skill = list.get(t[0].logic.skillid)),
            e.$set(a)
        },
        i(t) {
            n || (transition_in(e.$$.fragment, t),
            n = !0)
        },
        o(t) {
            transition_out(e.$$.fragment, t),
            n = !1
        },
        d(t) {
            destroy_component(e, t)
        }
    }
}
function create_if_block_2(t) {
    let e;
    return {
        c() {
            e = element("div"),
            e.textContent = "Press Shift to compare item.",
            attr(e, "class", "pack svelte-e3ao5j")
        },
        m(t, n) {
            insert(t, e, n)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_each_block$1(t) {
    let e, n, a, s, r, i, o = t[10][1] > 0 ? "+" : "", l = stat(t[10][0], t[10][1]) + "", c = loc.ui.stats.array[t[10][0]] + "";
    return {
        c() {
            e = element("div"),
            n = text(o),
            a = text(l),
            s = space(),
            r = text(c),
            attr(e, "class", i = "text" + (t[10][1] > 0 ? "green" : "red"))
        },
        m(t, i) {
            insert(t, e, i),
            append(e, n),
            append(e, a),
            append(e, s),
            append(e, r)
        },
        p(t, s) {
            8 & s && o !== (o = t[10][1] > 0 ? "+" : "") && set_data(n, o),
            8 & s && l !== (l = stat(t[10][0], t[10][1]) + "") && set_data(a, l),
            8 & s && c !== (c = loc.ui.stats.array[t[10][0]] + "") && set_data(r, c),
            8 & s && i !== (i = "text" + (t[10][1] > 0 ? "green" : "red")) && attr(e, "class", i)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block$1(t) {
    let e, n, a, s;
    return n = new Itemdescription({
        props: {
            item: t[2],
            comparison: !0
        }
    }),
    {
        c() {
            e = element("div"),
            create_component(n.$$.fragment),
            attr(e, "class", a = "slotdescription border " + quality(t[2].quality)[0] + " comparecontainer svelte-e3ao5j")
        },
        m(t, a) {
            insert(t, e, a),
            mount_component(n, e, null),
            s = !0
        },
        p(t, r) {
            const i = {};
            4 & r && (i.item = t[2]),
            n.$set(i),
            (!s || 4 & r && a !== (a = "slotdescription border " + quality(t[2].quality)[0] + " comparecontainer svelte-e3ao5j")) && attr(e, "class", a)
        },
        i(t) {
            s || (transition_in(n.$$.fragment, t),
            s = !0)
        },
        o(t) {
            transition_out(n.$$.fragment, t),
            s = !1
        },
        d(t) {
            t && detach(e),
            destroy_component(n)
        }
    }
}
function create_fragment$1(t) {
    let e, n, a, s, r, i, o, l, c, d, p, u, m, f, g, h, _, b, k, y, v, x, w, S, $, I, C, L = t[4] ? "T" + (t[0].tier + 1) + " " : "", B = itemName(t[0].type, t[0].tier) + "", M = t[0].upgrade ? " +" + t[0].upgrade : "", U = (t[0].stacks ? "" : quality(t[0].quality)[1]) + "", D = t[0].type + "", E = t[0].quality && !t[0].stacks ? t[0].quality + "%" : "", O = t[1] || t[0].canBeSold(), V = t[0].gs > 0 && create_if_block_17(t), A = t[0].dbid && create_if_block_16(t), P = t[7], F = [];
    for (let e = 0; e < P.length; e += 1)
        F[e] = create_each_block_4$1(get_each_context_4$1(t, P, e));
    let q = void 0 !== t[0].logic.custom && create_if_block_13(t)
      , H = t[0].equipReasons(world)
      , R = [];
    for (let e = 0; e < H.length; e += 1)
        R[e] = create_each_block_2$1(get_each_context_2$1(t, H, e));
    function T(t, e) {
        return t[0].bound > 0 ? create_if_block_9 : create_else_block_2
    }
    let j = T(t)
      , N = j(t)
      , z = O && create_if_block_4(t);
    const Y = [create_if_block_1$1, create_else_block$1]
      , W = [];
    function G(t, e) {
        return t[2] ? 0 : 1
    }
    S = G(t),
    $ = W[S] = Y[S](t);
    let Q = t[2] && create_if_block$1(t);
    return {
        c() {
            e = element("div"),
            n = element("div"),
            a = element("div"),
            s = text(L),
            r = text(B),
            i = element("span"),
            o = text(M),
            c = element("div"),
            d = text(U),
            p = space(),
            u = text(D),
            m = space(),
            f = element("span"),
            g = text(E),
            h = element("small"),
            V && V.c(),
            _ = empty(),
            A && A.c(),
            b = space(),
            k = element("div");
            for (let t = 0; t < F.length; t += 1)
                F[t].c();
            y = empty(),
            q && q.c(),
            v = element("div");
            for (let t = 0; t < R.length; t += 1)
                R[t].c();
            x = empty(),
            N.c(),
            z && z.c(),
            w = empty(),
            $.c(),
            Q && Q.c(),
            I = empty(),
            attr(i, "class", "textprimary"),
            attr(a, "class", l = "slottitle text" + quality(t[0].quality)[0] + " svelte-e3ao5j"),
            attr(c, "class", "type textwhite svelte-e3ao5j"),
            attr(n, "class", "pack svelte-e3ao5j"),
            attr(k, "class", "pack svelte-e3ao5j"),
            attr(v, "class", "pack svelte-e3ao5j"),
            attr(e, "class", "container svelte-e3ao5j")
        },
        m(t, l) {
            insert(t, e, l),
            append(e, n),
            append(n, a),
            append(a, s),
            append(a, r),
            append(a, i),
            append(i, o),
            append(n, c),
            append(c, d),
            append(c, p),
            append(c, u),
            append(c, m),
            append(c, f),
            append(f, g),
            append(n, h),
            V && V.m(h, null),
            append(h, _),
            A && A.m(h, null),
            append(n, b),
            append(e, k);
            for (let t = 0; t < F.length; t += 1)
                F[t].m(k, null);
            append(k, y),
            q && q.m(k, null),
            append(e, v);
            for (let t = 0; t < R.length; t += 1)
                R[t].m(v, null);
            append(v, x),
            N.m(v, null),
            z && z.m(e, null),
            append(e, w),
            W[S].m(e, null),
            Q && Q.m(t, l),
            insert(t, I, l),
            C = !0
        },
        p(t, [n]) {
            if ((!C || 17 & n) && L !== (L = t[4] ? "T" + (t[0].tier + 1) + " " : "") && set_data(s, L),
            (!C || 1 & n) && B !== (B = itemName(t[0].type, t[0].tier) + "") && set_data(r, B),
            (!C || 1 & n) && M !== (M = t[0].upgrade ? " +" + t[0].upgrade : "") && set_data(o, M),
            (!C || 1 & n && l !== (l = "slottitle text" + quality(t[0].quality)[0] + " svelte-e3ao5j")) && attr(a, "class", l),
            (!C || 1 & n) && U !== (U = (t[0].stacks ? "" : quality(t[0].quality)[1]) + "") && set_data(d, U),
            (!C || 1 & n) && D !== (D = t[0].type + "") && set_data(u, D),
            (!C || 1 & n) && E !== (E = t[0].quality && !t[0].stacks ? t[0].quality + "%" : "") && set_data(g, E),
            t[0].gs > 0 ? V ? V.p(t, n) : (V = create_if_block_17(t),
            V.c(),
            V.m(h, _)) : V && (V.d(1),
            V = null),
            t[0].dbid ? A ? A.p(t, n) : (A = create_if_block_16(t),
            A.c(),
            A.m(h, null)) : A && (A.d(1),
            A = null),
            145 & n) {
                let e;
                for (P = t[7],
                e = 0; e < P.length; e += 1) {
                    const a = get_each_context_4$1(t, P, e);
                    F[e] ? F[e].p(a, n) : (F[e] = create_each_block_4$1(a),
                    F[e].c(),
                    F[e].m(k, y))
                }
                for (; e < F.length; e += 1)
                    F[e].d(1);
                F.length = P.length
            }
            if (void 0 !== t[0].logic.custom ? q ? q.p(t, n) : (q = create_if_block_13(t),
            q.c(),
            q.m(k, null)) : q && (q.d(1),
            q = null),
            1 & n) {
                let e;
                for (H = t[0].equipReasons(world),
                e = 0; e < H.length; e += 1) {
                    const a = get_each_context_2$1(t, H, e);
                    R[e] ? R[e].p(a, n) : (R[e] = create_each_block_2$1(a),
                    R[e].c(),
                    R[e].m(v, x))
                }
                for (; e < R.length; e += 1)
                    R[e].d(1);
                R.length = H.length
            }
            j === (j = T(t)) && N ? N.p(t, n) : (N.d(1),
            N = j(t),
            N && (N.c(),
            N.m(v, null))),
            3 & n && (O = t[1] || t[0].canBeSold()),
            O ? z ? (z.p(t, n),
            3 & n && transition_in(z, 1)) : (z = create_if_block_4(t),
            z.c(),
            transition_in(z, 1),
            z.m(e, w)) : z && (group_outros(),
            transition_out(z, 1, 1, ()=>{
                z = null
            }
            ),
            check_outros());
            let i = S;
            S = G(t),
            S === i ? W[S].p(t, n) : (group_outros(),
            transition_out(W[i], 1, 1, ()=>{
                W[i] = null
            }
            ),
            check_outros(),
            $ = W[S],
            $ || ($ = W[S] = Y[S](t),
            $.c()),
            transition_in($, 1),
            $.m(e, null)),
            t[2] ? Q ? (Q.p(t, n),
            4 & n && transition_in(Q, 1)) : (Q = create_if_block$1(t),
            Q.c(),
            transition_in(Q, 1),
            Q.m(I.parentNode, I)) : Q && (group_outros(),
            transition_out(Q, 1, 1, ()=>{
                Q = null
            }
            ),
            check_outros())
        },
        i(t) {
            C || (transition_in(z),
            transition_in($),
            transition_in(Q),
            C = !0)
        },
        o(t) {
            transition_out(z),
            transition_out($),
            transition_out(Q),
            C = !1
        },
        d(t) {
            t && detach(e),
            V && V.d(),
            A && A.d(),
            destroy_each(F, t),
            q && q.d(),
            destroy_each(R, t),
            N.d(),
            z && z.d(),
            W[S].d(),
            Q && Q.d(t),
            t && detach(I)
        }
    }
}
function instance$1(t, e, n) {
    let a, {item: s} = e, {comparison: r=!1} = e, {isTrader: i=!1} = e, o = buttons.shift.store;
    component_subscribe(t, o, t=>n(4, a = t));
    let l, c, d, p = s.stats.has(10) ? Array.from(s.stats).filter(t=>11 !== t[0]) : Array.from(s.stats);
    return t.$$set = t=>{
        "item"in t && n(0, s = t.item),
        "comparison"in t && n(8, r = t.comparison),
        "isTrader"in t && n(1, i = t.isTrader)
    }
    ,
    t.$$.update = ()=>{
        273 & t.$$.dirty && (n(2, l = void 0),
        n(3, c = void 0)),
        257 & t.$$.dirty && n(5, d = !r && void 0 !== s.getEquipSlot())
    }
    ,
    [s, i, l, c, a, d, o, p, r]
}
class Itemdescription extends SvelteComponent {
    constructor(t) {
        super(),
        init(this, t, instance$1, create_fragment$1, safe_not_equal, {
            item: 0,
            comparison: 8,
            isTrader: 1
        })
    }
}
const generate$4 = t=>{
    list.forEach(e=>{
        if (!e.engineOnly)
            for (let n = 0; n < e.skilllevels; ++n) {
                const a = 5 * e.id + n;
                t["book" + a] = {
                    type: "book",
                    tier: a,
                    level: e.minlevel + 8 * n,
                    skillid: e.id,
                    skilllevel: n,
                    class: e.class,
                    noReward: e.noReward || !1,
                    goldValue: e.goldValue || (e.minlevel + 5 * n < 5 ? 4 : 0),
                    quality: Math.round(Math.min(99, 30 + n / 5 * 70)),
                    art: bookArt(a, e.class),
                    useSkill: 101,
                    use: (t,n,a,s)=>{
                        castSkill(t, e.id)
                    }
                }
            }
    }
    )
}
  , castSkill = (t,e,n)=>{}
  , boxes = [{
    id: 0,
    storeValue: 300,
    quality: 90,
    level: 1,
    custom: ["Contains random mount (account bound) of rare or epic quality"],
    bindOnPurchase: 1,
    use: (t,e,n,a)=>{}
}, {
    id: 1,
    storeValue: 900,
    quality: 90,
    level: 1,
    custom: ["Adds one month of Elixir to your account"],
    bindOnMerchant: 1,
    use: (t,e,n,a)=>{}
}]
  , generate$3 = t=>{
    boxes.forEach(e=>{
        t["box" + e.id] = {
            ...e,
            type: "box",
            tier: e.id,
            unsellable: !0,
            useSkill: 103
        }
    }
    )
}
  , generate$2 = t=>{
    for (const e in types)
        if (types[e].tiers) {
            const n = types[e];
            for (let a = 0; a < n.tiers; ++a)
                generateEquipment({
                    type: e,
                    tier: a,
                    stats: n.stats,
                    level: getItemLevel(e, a),
                    class: n.class,
                    quality: n.quality
                }, t)
        }
}
  , getItemLevel = (t,e)=>types[t].baselvl + Math.floor(e / types[t].tiers * 100)
  , generateEquipment = (t,e)=>{
    const n = {
        level: t.level,
        type: t.type,
        tier: t.tier,
        stats: t.stats ? new Map : void 0,
        class: t.class,
        quality: t.quality
    };
    t.stats && Object.keys(t.stats).sort((t,e)=>t - e).forEach(e=>{
        const a = t.stats[e];
        n.stats.set(parseInt(e), {
            min: a.base + t.level * a.min,
            max: a.base + (t.level + 10) * a.max
        })
    }
    ),
    e[t.type + t.tier] = n
}
  , generate$1 = t=>{
    const e = [250, 100, 500, 200, 1e3, 300];
    for (let n = 0; n < 6; ++n) {
        const a = Math.floor(n / 2)
          , s = n % 2 == 0;
        t["misc" + n] = {
            type: "misc",
            tier: n,
            level: 1 + 20 * a,
            goldvalue: 5 ** a,
            quality: 15,
            custom: [e[n] + (s ? " HP recovered" : " MP recovered")],
            useSkill: 100,
            use: (t,e,n,a)=>{}
        }
    }
}
  , pets = [1919, 1920]
  , generate = t=>{
    pets.forEach((e,n)=>{
        t["pet" + n] = {
            level: 10,
            unsellable: !0,
            storeValue: 900,
            quality: 90,
            bindOnUse: 1,
            bindOnMerchant: 1,
            type: "pet",
            tier: n,
            useSkill: 104,
            use: (t,e,n,a,s)=>!0
        }
    }
    )
}
  , logic = {};
generate$2(logic),
generate$1(logic),
generate$4(logic),
generate$6(logic),
generate$5(logic),
generate(logic),
generate$3(logic),
Object.values(logic);
const canEquip = (t,e,n,a,s,r)=>canEquipLevel(t, s, r) && canEquipClass(a, s, r) && canLearnBook(n, s, r) && hasrequiredSkill(e, s, r)
  , canEquipLevel = (t,e,n)=>t >= logic[e + n].level
  , canEquipClass = (t,e,n)=>void 0 === logic[e + n].class || t === logic[e + n].class
  , canLearnBook = (t,e,n)=>"book" !== e || getSkillLevel(t, logic[e + n].skillid) === logic[e + n].skilllevel
  , getSkillLevel = (t,e)=>t.reduce((t,n)=>t + (n === e), 0)
  , hasrequiredSkill = (t,e,n)=>void 0 === logic[e + n].requiredSkill || t.indexOf(logic[e + n].requiredSkill) > 0
  , itemValue = (t,e,n,a)=>Math.ceil(t.goldValue || (.4 * (t.level ** 1.3 + .4 * e)) ** (1.1 + e / 100) / types[t.type].drop) * (n || 1) * (a ? 8 : 1);
class CoreItem {
    constructor(t) {
        this.dbid = t,
        this.stats = new Map,
        this.dirty = !0
    }
    hydrate(t) {
        if (this.dirty = !1,
        this.bound = t.bound,
        this.type = t.type,
        this.tier = t.tier,
        this.logic = logic[this.type + this.tier],
        this.auction = t.auction ? new Date(t.auction) : void 0,
        this.auctionprice = t.auctionprice,
        this.owner = t.name,
        this.stash = t.stash ? new Date(t.stash) : void 0,
        void 0 === this.logic)
            throw "Unknown item " + t.type + t.tier;
        if (this.upgrade = t.upgrade,
        this.stats.clear(),
        t.rolls) {
            if (this.setRolls(t.rolls),
            this.quality = this.nextRoll(),
            this.logic.stats) {
                this.logic.stats.forEach((t,e)=>{
                    this.stats.set(e, {
                        type: "base",
                        qual: this.quality,
                        value: Math.floor(t.min + (t.max - t.min) * (this.quality / 100) ** 2 + upgradeGains[e] * this.upgrade)
                    })
                }
                );
                const t = Math.min(4, Math.round((this.quality / 100) ** 1.5 * 3.6));
                for (let e = 0; e < t; ++e) {
                    let t = this.nextRoll()
                      , e = -1;
                    for (; -1 === e || this.stats.has(e); )
                        e = parseInt(rndArrayFixed(randomStatKeys, t / 101)),
                        t = (t + 5) % 100;
                    const n = (this.nextRoll() + this.quality) / 2;
                    this.stats.set(e, {
                        type: "bonus",
                        qual: n,
                        value: Math.ceil(Math.max((randomStats[e].min + (randomStats[e].max - randomStats[e].min) * (n / 100) ** 2) * this.logic.level * types[this.type].weight, upgradeGains[e]) + upgradeGains[e] * this.upgrade)
                    })
                }
            }
            this.quality = this.logic.quality || this.quality,
            this.stacks = void 0
        } else
            this.stacks = t.stacks,
            this.quality = this.logic.quality || 0;
        this.gs = 0,
        this.logic.gs ? this.gs = this.logic.gs : this.stats.forEach((t,e)=>{
            if (17 === e)
                return;
            let n = t.value / upgradeGains[e];
            "shield" == this.type && "base" == t.type && (n *= .5),
            "orb" == this.type && "base" == t.type && (n *= .7),
            this.gs += n
        }
        ),
        this.gs = Math.round(this.gs)
    }
    setRolls(t) {
        this.rolls = t,
        this.currentRoll = 0
    }
    nextRoll() {
        if (this.currentRoll == this.rolls.length)
            throw "roll maximum reached";
        return this.rolls[this.currentRoll++]
    }
    use(t) {
        this.logic.use && this.logic.use(t)
    }
    goldValue(t) {
        if (!this.canBeSold())
            throw "Item cant have value because it cant be sold";
        return itemValue(this.logic, this.quality, this.stacks, t)
    }
    storeValue() {
        return this.logic.storeValue || 0
    }
    medalValue() {
        return this.logic.medalValue || 0
    }
    canEquip(t) {
        return canEquip(t.level, t.skills.skillIdsActive, t.skills.skillIdsLearned, t.class, this.type, this.tier)
    }
    canEquipClass(t) {
        return canEquipClass(t.class, this.type, this.tier)
    }
    equipReasons(t) {
        const e = [];
        return this.logic.level && e.push(["Lv. " + this.logic.level, !0]),
        e
    }
    canBeDropped() {
        return !types[this.type].undroppable && !this.bound
    }
    canBeTraded() {
        return !this.bound
    }
    canBeSold() {
        return !this.logic.unsellable
    }
    getStashTime() {
        return this.dirty ? 0 : void 0 !== this.stash ? this.stash.getTime() : 0
    }
    getEquipSlot() {
        return void 0 !== types[this.type].slot ? types[this.type].slot[0] : void 0
    }
}
function get_each_context(t, e, n) {
    const a = t.slice();
    return a[29] = e[n],
    a
}
function get_each_context_1(t, e, n) {
    const a = t.slice();
    return a[32] = e[n],
    a
}
function get_each_context_2(t, e, n) {
    const a = t.slice();
    return a[35] = e[n],
    a
}
function get_each_context_3(t, e, n) {
    const a = t.slice();
    return a[32] = e[n],
    a
}
function get_each_context_4(t, e, n) {
    const a = t.slice();
    return a[40] = e[n],
    a
}
function get_each_context_5(t, e, n) {
    const a = t.slice();
    return a[43] = e[n],
    a
}
function get_each_context_6(t, e, n) {
    const a = t.slice();
    return a[46] = e[n],
    a
}
function create_if_block(t) {
    let e, n, a, s, r, i, o, l, c, d, p, u, m, f, g, h, _, b, k, y, v, x, w, S, $, I, C, L, B, M, U, D, E, O, V, A, P, F, q, H, R, T, j, N, z, Y, W, G, Q, J, K, Z;
    const X = [create_if_block_1, create_else_block]
      , tt = [];
    function et(t, e) {
        return t[1] ? 0 : 1
    }
    i = et(t),
    o = tt[i] = X[i](t);
    let nt = t[5]
      , at = [];
    for (let e = 0; e < nt.length; e += 1)
        at[e] = create_each_block(get_each_context(t, nt, e));
    const st = t=>transition_out(at[t], 1, 1, ()=>{
        at[t] = null
    }
    );
    return {
        c() {
            e = element("div"),
            n = element("div"),
            a = element("h1"),
            a.textContent = "Boss Kill Logs",
            s = element("p"),
            s.textContent = "Inspect Boss Kill Logs and Parses of Player / Class Performance.",
            r = element("div"),
            o.c(),
            l = element("div"),
            c = element("div"),
            d = element("select"),
            p = element("option"),
            p.textContent = "Damage",
            m = element("option"),
            m.textContent = "Healing",
            g = element("option"),
            g.textContent = "Mitigation",
            _ = element("select"),
            b = element("option"),
            k = text("All Classes"),
            y = element("option"),
            y.textContent = "Warrior",
            x = element("option"),
            x.textContent = "Mage",
            S = element("option"),
            S.textContent = "Archer",
            I = element("option"),
            I.textContent = "Shaman",
            L = element("input"),
            B = element("input"),
            M = element("div"),
            M.textContent = "Search",
            U = element("table"),
            D = element("thead"),
            E = element("tr"),
            O = element("th"),
            O.textContent = "Build",
            V = element("th"),
            V.textContent = "Kill ID",
            A = element("th"),
            A.textContent = "Time",
            P = element("th"),
            P.textContent = "Player",
            F = element("th"),
            q = element("th"),
            q.textContent = "GS",
            H = element("th"),
            R = text("Total"),
            j = element("th"),
            N = text(t[3]),
            Y = element("th"),
            W = text("Dur."),
            Q = element("tbody");
            for (let t = 0; t < at.length; t += 1)
                at[t].c();
            attr(a, "class", "textprimary"),
            attr(s, "class", "textgrey"),
            attr(r, "class", "marg-top panel-black textgrey"),
            set_style(r, "font-family", "monospace"),
            set_style(r, "font-size", "13px"),
            attr(n, "class", "row"),
            attr(e, "class", "fold"),
            p.__value = u = "dps",
            p.value = p.__value,
            m.__value = f = "hps",
            m.value = m.__value,
            g.__value = h = "mps",
            g.value = g.__value,
            attr(d, "class", "navbtn"),
            void 0 === t[3] && add_render_callback(()=>t[14].call(d)),
            b.__value = void 0,
            b.value = b.__value,
            y.__value = v = 0,
            y.value = y.__value,
            x.__value = w = 1,
            x.value = x.__value,
            S.__value = $ = 2,
            S.value = S.__value,
            I.__value = C = 3,
            I.value = I.__value,
            attr(_, "class", "navbtn"),
            void 0 === t[4] && add_render_callback(()=>t[15].call(_)),
            set_style(L, "width", "100px"),
            attr(L, "class", "navbtn"),
            attr(L, "type", "number"),
            attr(L, "placeholder", "Kill ID"),
            set_style(B, "width", "100px"),
            attr(B, "class", "navbtn"),
            attr(B, "type", "number"),
            attr(B, "placeholder", "Build ID"),
            attr(M, "class", "btn green navbtn formatted"),
            attr(c, "class", "subnav"),
            attr(O, "width", "5%"),
            attr(O, "class", "textcenter hide1 svelte-m87by6"),
            attr(V, "width", "5%"),
            attr(V, "class", "textcenter"),
            attr(A, "width", "7%"),
            attr(A, "class", "textcenter hide3 svelte-m87by6"),
            attr(P, "width", "20%"),
            attr(F, "width", "35%"),
            attr(F, "class", "textcenter hide4 svelte-m87by6"),
            attr(q, "width", "8%"),
            attr(q, "class", "textcenter hide2 svelte-m87by6"),
            attr(H, "width", "12%"),
            attr(H, "class", T = "textright text" + (t[6] == t[3] + "total" ? "white" : "primary")),
            attr(j, "width", "8%"),
            set_style(j, "text-transform", "uppercase"),
            attr(j, "class", z = "textright text" + (t[6] == t[3] ? "white" : "primary")),
            attr(Y, "width", "8%"),
            attr(Y, "class", G = "textcenter text" + ("duration" == t[6] ? "white" : "primary") + " textcenter"),
            attr(E, "class", "textprimary"),
            attr(U, "class", "marg-top panel-black"),
            set_style(U, "width", "100%"),
            set_style(U, "table-layout", "fixed"),
            attr(l, "class", "row")
        },
        m(o, u) {
            insert(o, e, u),
            append(e, n),
            append(n, a),
            append(n, s),
            append(n, r),
            tt[i].m(r, null),
            insert(o, l, u),
            append(l, c),
            append(c, d),
            append(d, p),
            append(d, m),
            append(d, g),
            select_option(d, t[3]),
            append(c, _),
            append(_, b),
            append(b, k),
            append(_, y),
            append(_, x),
            append(_, S),
            append(_, I),
            select_option(_, t[4]),
            append(c, L),
            set_input_value(L, t[0]),
            append(c, B),
            set_input_value(B, t[2]),
            append(c, M),
            append(l, U),
            append(U, D),
            append(D, E),
            append(E, O),
            append(E, V),
            append(E, A),
            append(E, P),
            append(E, F),
            append(E, q),
            append(E, H),
            append(H, R),
            append(E, j),
            append(j, N),
            append(E, Y),
            append(Y, W),
            append(U, Q);
            for (let t = 0; t < at.length; t += 1)
                at[t].m(Q, null);
            J = !0,
            K || (Z = [listen(d, "change", t[14]), listen(d, "change", t[12]), listen(_, "change", t[15]), listen(L, "input", t[16]), listen(B, "input", t[17]), listen(M, "click", t[10]), listen(H, "click", t[18]), listen(j, "click", t[19]), listen(Y, "click", t[20])],
            K = !0)
        },
        p(t, e) {
            let n = i;
            if (i = et(t),
            i === n ? tt[i].p(t, e) : (group_outros(),
            transition_out(tt[n], 1, 1, ()=>{
                tt[n] = null
            }
            ),
            check_outros(),
            o = tt[i],
            o || (o = tt[i] = X[i](t),
            o.c()),
            transition_in(o, 1),
            o.m(r, null)),
            8 & e[0] && select_option(d, t[3]),
            16 & e[0] && select_option(_, t[4]),
            1 & e[0] && to_number(L.value) !== t[0] && set_input_value(L, t[0]),
            4 & e[0] && to_number(B.value) !== t[2] && set_input_value(B, t[2]),
            (!J || 72 & e[0] && T !== (T = "textright text" + (t[6] == t[3] + "total" ? "white" : "primary"))) && attr(H, "class", T),
            (!J || 8 & e[0]) && set_data(N, t[3]),
            (!J || 72 & e[0] && z !== (z = "textright text" + (t[6] == t[3] ? "white" : "primary"))) && attr(j, "class", z),
            (!J || 64 & e[0] && G !== (G = "textcenter text" + ("duration" == t[6] ? "white" : "primary") + " textcenter")) && attr(Y, "class", G),
            8810 & e[0]) {
                let n;
                for (nt = t[5],
                n = 0; n < nt.length; n += 1) {
                    const a = get_each_context(t, nt, n);
                    at[n] ? (at[n].p(a, e),
                    transition_in(at[n], 1)) : (at[n] = create_each_block(a),
                    at[n].c(),
                    transition_in(at[n], 1),
                    at[n].m(Q, null))
                }
                for (group_outros(),
                n = nt.length; n < at.length; n += 1)
                    st(n);
                check_outros()
            }
        },
        i(t) {
            if (!J) {
                transition_in(o);
                for (let t = 0; t < nt.length; t += 1)
                    transition_in(at[t]);
                J = !0
            }
        },
        o(t) {
            transition_out(o),
            at = at.filter(Boolean);
            for (let t = 0; t < at.length; t += 1)
                transition_out(at[t]);
            J = !1
        },
        d(t) {
            t && detach(e),
            tt[i].d(),
            t && detach(l),
            destroy_each(at, t),
            K = !1,
            run_all(Z)
        }
    }
}
function create_else_block(t) {
    let e;
    return {
        c() {
            e = element("div"),
            e.textContent = "Select a log entry for more details"
        },
        m(t, n) {
            insert(t, e, n)
        },
        p: noop,
        i: noop,
        o: noop,
        d(t) {
            t && detach(e)
        }
    }
}
function create_if_block_1(t) {
    let e, n, a, s, r, i, o, l, c, d, p, u, m, f, g, h, _, b, k, y, v, x, w, S, $, I, C, L, B, M, U, D, E, O, V, A, P, F, q, H, R, T, j, N, z, Y, W, G, Q, J, K, Z, X, tt, et, nt, at, st, rt, it, ot, lt, ct, dt, pt, ut, mt, ft, gt, ht, _t, bt, kt, yt, vt, xt, wt, St, $t, It, Ct, Lt, Bt, Mt, Ut, Dt, Et, Ot, Vt, At, Pt, Ft, qt, Ht, Rt, Tt, jt, Nt, zt, Yt, Wt, Gt, Qt, Jt, Kt, Zt, Xt, te, ee, ne, ae, se, re, ie, oe, le, ce, de, pe = t[1].name + "", ue = t[1].id + "", me = dayjs(t[1].time).format("MMM DD, YYYY HH:mm") + "", fe = formatDurationDot(t[1].duration) + "", ge = formatDurationDot(t[1].active) + "", he = t[1].deaths + "", _e = longnum(t[1].stats[4]) + "", be = longnum(t[1].stats[5]) + "", ke = stat(13, t[1].stats[6]) + "", ye = longnum(t[1].stats[7]) + "", ve = t[1].stats[0] + "", xe = t[1].stats[1] + "", we = stat(14, t[1].stats[2]) + "", Se = stat(16, t[1].stats[3]) + "", $e = longnum(t[1].dpstotal) + "", Ie = longnum(t[1].dps) + "", Ce = t[1].perfdps + "", Le = longnum(t[1].hpstotal) + "", Be = longnum(t[1].hps) + "", Me = t[1].perfhps + "", Ue = longnum(t[1].ehps) + "", De = longnum(t[1].ohps) + "", Ee = longnum(t[1].totalcasts) + "", Oe = t[1].castps.toFixed(1) + "", Ve = longnum(t[1].mpstotal) + "", Ae = longnum(t[1].mps) + "", Pe = t[1].perfmit + "", Fe = t[1].parsedSkills, qe = [];
    for (let e = 0; e < Fe.length; e += 1)
        qe[e] = create_each_block_6(get_each_context_6(t, Fe, e));
    let He = t[1].items
      , Re = [];
    for (let e = 0; e < He.length; e += 1)
        Re[e] = create_each_block_5(get_each_context_5(t, He, e));
    const Te = t=>transition_out(Re[t], 1, 1, ()=>{
        Re[t] = null
    }
    );
    let je = t[1].parsedDmg
      , Ne = [];
    for (let e = 0; e < je.length; e += 1)
        Ne[e] = create_each_block_4(get_each_context_4(t, je, e));
    let ze = t[1].parsedHeal
      , Ye = [];
    for (let e = 0; e < ze.length; e += 1)
        Ye[e] = create_each_block_3(get_each_context_3(t, ze, e));
    let We = t[1].parsedCasts
      , Ge = [];
    for (let e = 0; e < We.length; e += 1)
        Ge[e] = create_each_block_2(get_each_context_2(t, We, e));
    let Qe = t[1].parsedMit
      , Je = [];
    for (let e = 0; e < Qe.length; e += 1)
        Je[e] = create_each_block_1(get_each_context_1(t, Qe, e));
    return {
        c() {
            e = element("div"),
            n = element("div"),
            a = element("div"),
            s = element("span"),
            r = text(pe),
            o = text(" Log "),
            l = text(ue),
            c = element("div"),
            d = text(me),
            p = element("div"),
            u = text("Duration "),
            m = text(fe),
            f = element("div"),
            g = text("Active "),
            h = text(ge),
            _ = element("div"),
            b = text(he),
            k = text(" Deaths"),
            y = element("div"),
            y.textContent = "Skill Setup";
            for (let t = 0; t < qe.length; t += 1)
                qe[t].c();
            v = element("div"),
            x = element("div"),
            x.textContent = "Equipped Items",
            w = element("div");
            for (let t = 0; t < Re.length; t += 1)
                Re[t].c();
            S = element("div"),
            S.textContent = "Stats",
            $ = element("div"),
            I = element("span"),
            C = text(_e),
            L = text(" HP / "),
            B = element("span"),
            M = text(be),
            U = text(" MP"),
            D = element("div"),
            E = element("span"),
            O = text(ke),
            V = text("% Block"),
            A = element("div"),
            P = element("span"),
            F = text(ye),
            q = text(" Defense"),
            H = element("div"),
            R = element("span"),
            T = text(ve),
            j = text(" - "),
            N = text(xe),
            z = text(" Damage"),
            Y = element("div"),
            W = element("span"),
            G = text(we),
            Q = text(" Crit"),
            J = element("div"),
            K = element("span"),
            Z = text(Se),
            X = text(" Haste"),
            tt = element("div"),
            et = element("div"),
            et.textContent = "Damage";
            for (let t = 0; t < Ne.length; t += 1)
                Ne[t].c();
            nt = element("div"),
            nt.textContent = "---",
            at = element("div"),
            st = element("span"),
            rt = text($e),
            it = text(" Total"),
            ot = element("div"),
            lt = element("span"),
            ct = text(Ie),
            dt = text(" DPS "),
            pt = element("span"),
            ut = text(Ce),
            mt = text("%"),
            gt = element("div"),
            ht = element("div"),
            ht.textContent = "Healing";
            for (let t = 0; t < Ye.length; t += 1)
                Ye[t].c();
            _t = element("div"),
            _t.textContent = "---",
            bt = element("div"),
            kt = element("span"),
            yt = text(Le),
            vt = text(" Total Healing"),
            xt = element("div"),
            wt = element("span"),
            St = text(Be),
            $t = text(" HPS "),
            It = element("span"),
            Ct = text(Me),
            Lt = text("%"),
            Mt = element("div"),
            Ut = element("span"),
            Dt = text(Ue),
            Et = text(" eHPS"),
            Ot = element("div"),
            Vt = element("span"),
            At = text(De),
            Pt = text(" oHPS"),
            Ft = element("div"),
            qt = element("div"),
            qt.textContent = "Casts";
            for (let t = 0; t < Ge.length; t += 1)
                Ge[t].c();
            Ht = element("div"),
            Ht.textContent = "---",
            Rt = element("div"),
            Tt = element("span"),
            jt = text(Ee),
            Nt = text(" Total"),
            zt = element("div"),
            Yt = element("span"),
            Wt = text(Oe),
            Gt = text(" Per Second"),
            Qt = element("div"),
            Jt = element("div"),
            Jt.textContent = "Incoming Damage";
            for (let t = 0; t < Je.length; t += 1)
                Je[t].c();
            Kt = element("div"),
            Kt.textContent = "---",
            Zt = element("div"),
            Xt = element("span"),
            te = text(Ve),
            ee = text(" Total"),
            ne = element("div"),
            ae = element("span"),
            se = text(Ae),
            re = text(" MPS "),
            ie = element("span"),
            oe = text(Pe),
            le = text("%"),
            attr(s, "class", i = "textf" + t[1].faction + " svelte-m87by6"),
            attr(y, "class", "marg-top textblue"),
            attr(n, "class", "detailcard svelte-m87by6"),
            attr(x, "class", "textblue"),
            attr(w, "class", "marg-top"),
            set_style(w, "display", "inline-flex"),
            set_style(w, "flex-wrap", "wrap"),
            set_style(w, "width", "180px"),
            attr(S, "class", "textblue marg-top"),
            attr(I, "class", "textgreen"),
            attr(B, "class", "textblue"),
            attr(E, "class", "textwhite"),
            attr(P, "class", "textwhite"),
            attr(R, "class", "textwhite"),
            attr(W, "class", "textwhite"),
            attr(K, "class", "textwhite"),
            attr(v, "class", "detailcard svelte-m87by6"),
            attr(et, "class", "textred"),
            attr(st, "class", "textprimary"),
            attr(lt, "class", "textprimary"),
            attr(pt, "class", ft = "text" + t[9](t[1].perfdps) + " svelte-m87by6"),
            attr(tt, "class", "detailcard svelte-m87by6"),
            attr(ht, "class", "textgreen"),
            attr(kt, "class", "textprimary"),
            attr(wt, "class", "textprimary"),
            attr(It, "class", Bt = "text" + t[9](t[1].perfhps) + " svelte-m87by6"),
            attr(Ut, "class", "textprimary"),
            attr(Vt, "class", "textblue"),
            attr(gt, "class", "detailcard svelte-m87by6"),
            attr(qt, "class", "textpurp"),
            attr(Tt, "class", "textprimary"),
            attr(Yt, "class", "textprimary"),
            attr(Ft, "class", "detailcard svelte-m87by6"),
            attr(Jt, "class", "textwhite"),
            attr(Xt, "class", "textprimary"),
            attr(ae, "class", "textprimary"),
            attr(ie, "class", ce = "text" + t[9](t[1].perfmit) + " svelte-m87by6"),
            attr(Qt, "class", "detailcard svelte-m87by6"),
            attr(e, "class", "details svelte-m87by6")
        },
        m(t, i) {
            insert(t, e, i),
            append(e, n),
            append(n, a),
            append(a, s),
            append(s, r),
            append(a, o),
            append(a, l),
            append(n, c),
            append(c, d),
            append(n, p),
            append(p, u),
            append(p, m),
            append(n, f),
            append(f, g),
            append(f, h),
            append(n, _),
            append(_, b),
            append(_, k),
            append(n, y);
            for (let t = 0; t < qe.length; t += 1)
                qe[t].m(n, null);
            append(e, v),
            append(v, x),
            append(v, w);
            for (let t = 0; t < Re.length; t += 1)
                Re[t].m(w, null);
            append(v, S),
            append(v, $),
            append($, I),
            append(I, C),
            append($, L),
            append($, B),
            append(B, M),
            append($, U),
            append(v, D),
            append(D, E),
            append(E, O),
            append(D, V),
            append(v, A),
            append(A, P),
            append(P, F),
            append(A, q),
            append(v, H),
            append(H, R),
            append(R, T),
            append(R, j),
            append(R, N),
            append(H, z),
            append(v, Y),
            append(Y, W),
            append(W, G),
            append(Y, Q),
            append(v, J),
            append(J, K),
            append(K, Z),
            append(J, X),
            append(e, tt),
            append(tt, et);
            for (let t = 0; t < Ne.length; t += 1)
                Ne[t].m(tt, null);
            append(tt, nt),
            append(tt, at),
            append(at, st),
            append(st, rt),
            append(at, it),
            append(tt, ot),
            append(ot, lt),
            append(lt, ct),
            append(ot, dt),
            append(ot, pt),
            append(pt, ut),
            append(pt, mt),
            append(e, gt),
            append(gt, ht);
            for (let t = 0; t < Ye.length; t += 1)
                Ye[t].m(gt, null);
            append(gt, _t),
            append(gt, bt),
            append(bt, kt),
            append(kt, yt),
            append(bt, vt),
            append(gt, xt),
            append(xt, wt),
            append(wt, St),
            append(xt, $t),
            append(xt, It),
            append(It, Ct),
            append(It, Lt),
            append(gt, Mt),
            append(Mt, Ut),
            append(Ut, Dt),
            append(Mt, Et),
            append(gt, Ot),
            append(Ot, Vt),
            append(Vt, At),
            append(Ot, Pt),
            append(e, Ft),
            append(Ft, qt);
            for (let t = 0; t < Ge.length; t += 1)
                Ge[t].m(Ft, null);
            append(Ft, Ht),
            append(Ft, Rt),
            append(Rt, Tt),
            append(Tt, jt),
            append(Rt, Nt),
            append(Ft, zt),
            append(zt, Yt),
            append(Yt, Wt),
            append(zt, Gt),
            append(e, Qt),
            append(Qt, Jt);
            for (let t = 0; t < Je.length; t += 1)
                Je[t].m(Qt, null);
            append(Qt, Kt),
            append(Qt, Zt),
            append(Zt, Xt),
            append(Xt, te),
            append(Zt, ee),
            append(Qt, ne),
            append(ne, ae),
            append(ae, se),
            append(ne, re),
            append(ne, ie),
            append(ie, oe),
            append(ie, le),
            de = !0
        },
        p(t, e) {
            if ((!de || 2 & e[0]) && pe !== (pe = t[1].name + "") && set_data(r, pe),
            (!de || 2 & e[0] && i !== (i = "textf" + t[1].faction + " svelte-m87by6")) && attr(s, "class", i),
            (!de || 2 & e[0]) && ue !== (ue = t[1].id + "") && set_data(l, ue),
            (!de || 2 & e[0]) && me !== (me = dayjs(t[1].time).format("MMM DD, YYYY HH:mm") + "") && set_data(d, me),
            (!de || 2 & e[0]) && fe !== (fe = formatDurationDot(t[1].duration) + "") && set_data(m, fe),
            (!de || 2 & e[0]) && ge !== (ge = formatDurationDot(t[1].active) + "") && set_data(h, ge),
            (!de || 2 & e[0]) && he !== (he = t[1].deaths + "") && set_data(b, he),
            2 & e[0]) {
                let a;
                for (Fe = t[1].parsedSkills,
                a = 0; a < Fe.length; a += 1) {
                    const s = get_each_context_6(t, Fe, a);
                    qe[a] ? qe[a].p(s, e) : (qe[a] = create_each_block_6(s),
                    qe[a].c(),
                    qe[a].m(n, null))
                }
                for (; a < qe.length; a += 1)
                    qe[a].d(1);
                qe.length = Fe.length
            }
            if (770 & e[0]) {
                let n;
                for (He = t[1].items,
                n = 0; n < He.length; n += 1) {
                    const a = get_each_context_5(t, He, n);
                    Re[n] ? (Re[n].p(a, e),
                    transition_in(Re[n], 1)) : (Re[n] = create_each_block_5(a),
                    Re[n].c(),
                    transition_in(Re[n], 1),
                    Re[n].m(w, null))
                }
                for (group_outros(),
                n = He.length; n < Re.length; n += 1)
                    Te(n);
                check_outros()
            }
            if ((!de || 2 & e[0]) && _e !== (_e = longnum(t[1].stats[4]) + "") && set_data(C, _e),
            (!de || 2 & e[0]) && be !== (be = longnum(t[1].stats[5]) + "") && set_data(M, be),
            (!de || 2 & e[0]) && ke !== (ke = stat(13, t[1].stats[6]) + "") && set_data(O, ke),
            (!de || 2 & e[0]) && ye !== (ye = longnum(t[1].stats[7]) + "") && set_data(F, ye),
            (!de || 2 & e[0]) && ve !== (ve = t[1].stats[0] + "") && set_data(T, ve),
            (!de || 2 & e[0]) && xe !== (xe = t[1].stats[1] + "") && set_data(N, xe),
            (!de || 2 & e[0]) && we !== (we = stat(14, t[1].stats[2]) + "") && set_data(G, we),
            (!de || 2 & e[0]) && Se !== (Se = stat(16, t[1].stats[3]) + "") && set_data(Z, Se),
            2 & e[0]) {
                let n;
                for (je = t[1].parsedDmg,
                n = 0; n < je.length; n += 1) {
                    const a = get_each_context_4(t, je, n);
                    Ne[n] ? Ne[n].p(a, e) : (Ne[n] = create_each_block_4(a),
                    Ne[n].c(),
                    Ne[n].m(tt, nt))
                }
                for (; n < Ne.length; n += 1)
                    Ne[n].d(1);
                Ne.length = je.length
            }
            if ((!de || 2 & e[0]) && $e !== ($e = longnum(t[1].dpstotal) + "") && set_data(rt, $e),
            (!de || 2 & e[0]) && Ie !== (Ie = longnum(t[1].dps) + "") && set_data(ct, Ie),
            (!de || 2 & e[0]) && Ce !== (Ce = t[1].perfdps + "") && set_data(ut, Ce),
            (!de || 2 & e[0] && ft !== (ft = "text" + t[9](t[1].perfdps) + " svelte-m87by6")) && attr(pt, "class", ft),
            2 & e[0]) {
                let n;
                for (ze = t[1].parsedHeal,
                n = 0; n < ze.length; n += 1) {
                    const a = get_each_context_3(t, ze, n);
                    Ye[n] ? Ye[n].p(a, e) : (Ye[n] = create_each_block_3(a),
                    Ye[n].c(),
                    Ye[n].m(gt, _t))
                }
                for (; n < Ye.length; n += 1)
                    Ye[n].d(1);
                Ye.length = ze.length
            }
            if ((!de || 2 & e[0]) && Le !== (Le = longnum(t[1].hpstotal) + "") && set_data(yt, Le),
            (!de || 2 & e[0]) && Be !== (Be = longnum(t[1].hps) + "") && set_data(St, Be),
            (!de || 2 & e[0]) && Me !== (Me = t[1].perfhps + "") && set_data(Ct, Me),
            (!de || 2 & e[0] && Bt !== (Bt = "text" + t[9](t[1].perfhps) + " svelte-m87by6")) && attr(It, "class", Bt),
            (!de || 2 & e[0]) && Ue !== (Ue = longnum(t[1].ehps) + "") && set_data(Dt, Ue),
            (!de || 2 & e[0]) && De !== (De = longnum(t[1].ohps) + "") && set_data(At, De),
            2 & e[0]) {
                let n;
                for (We = t[1].parsedCasts,
                n = 0; n < We.length; n += 1) {
                    const a = get_each_context_2(t, We, n);
                    Ge[n] ? Ge[n].p(a, e) : (Ge[n] = create_each_block_2(a),
                    Ge[n].c(),
                    Ge[n].m(Ft, Ht))
                }
                for (; n < Ge.length; n += 1)
                    Ge[n].d(1);
                Ge.length = We.length
            }
            if ((!de || 2 & e[0]) && Ee !== (Ee = longnum(t[1].totalcasts) + "") && set_data(jt, Ee),
            (!de || 2 & e[0]) && Oe !== (Oe = t[1].castps.toFixed(1) + "") && set_data(Wt, Oe),
            2 & e[0]) {
                let n;
                for (Qe = t[1].parsedMit,
                n = 0; n < Qe.length; n += 1) {
                    const a = get_each_context_1(t, Qe, n);
                    Je[n] ? Je[n].p(a, e) : (Je[n] = create_each_block_1(a),
                    Je[n].c(),
                    Je[n].m(Qt, Kt))
                }
                for (; n < Je.length; n += 1)
                    Je[n].d(1);
                Je.length = Qe.length
            }
            (!de || 2 & e[0]) && Ve !== (Ve = longnum(t[1].mpstotal) + "") && set_data(te, Ve),
            (!de || 2 & e[0]) && Ae !== (Ae = longnum(t[1].mps) + "") && set_data(se, Ae),
            (!de || 2 & e[0]) && Pe !== (Pe = t[1].perfmit + "") && set_data(oe, Pe),
            (!de || 2 & e[0] && ce !== (ce = "text" + t[9](t[1].perfmit) + " svelte-m87by6")) && attr(ie, "class", ce)
        },
        i(t) {
            if (!de) {
                for (let t = 0; t < He.length; t += 1)
                    transition_in(Re[t]);
                de = !0
            }
        },
        o(t) {
            Re = Re.filter(Boolean);
            for (let t = 0; t < Re.length; t += 1)
                transition_out(Re[t]);
            de = !1
        },
        d(t) {
            t && detach(e),
            destroy_each(qe, t),
            destroy_each(Re, t),
            destroy_each(Ne, t),
            destroy_each(Ye, t),
            destroy_each(Ge, t),
            destroy_each(Je, t)
        }
    }
}
function create_each_block_6(t) {
    let e, n, a, s, r, i = t[46][1] + "", o = t[46][0] + "";
    return {
        c() {
            e = element("div"),
            n = element("span"),
            a = text(i),
            s = space(),
            r = text(o),
            attr(n, "class", "textwhite")
        },
        m(t, i) {
            insert(t, e, i),
            append(e, n),
            append(n, a),
            append(e, s),
            append(e, r)
        },
        p(t, e) {
            2 & e[0] && i !== (i = t[46][1] + "") && set_data(a, i),
            2 & e[0] && o !== (o = t[46][0] + "") && set_data(r, o)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_default_slot_1(t) {
    let e, n;
    return e = new Itemdescription({
        props: {
            isTrader: !1,
            item: t[43]
        }
    }),
    {
        c() {
            create_component(e.$$.fragment)
        },
        m(t, a) {
            mount_component(e, t, a),
            n = !0
        },
        p(t, n) {
            const a = {};
            2 & n[0] && (a.item = t[43]),
            e.$set(a)
        },
        i(t) {
            n || (transition_in(e.$$.fragment, t),
            n = !0)
        },
        o(t) {
            transition_out(e.$$.fragment, t),
            n = !1
        },
        d(t) {
            destroy_component(e, t)
        }
    }
}
function create_each_block_5(t) {
    let e, n, a;
    return n = new Slot({
        props: {
            pickable: !1,
            img: item(t[43].type, t[43].tier, t[43].logic ? t[43].logic.class : 0, t[8](t[43].quality)),
            stacks: t[43].stacks || (t[43].upgrade ? "+" + t[43].upgrade : ""),
            border: t[9](t[43].quality),
            descPos: "top: 100%; left: 100%;",
            $$slots: {
                default: [create_default_slot_1]
            },
            $$scope: {
                ctx: t
            }
        }
    }),
    {
        c() {
            e = element("div"),
            create_component(n.$$.fragment),
            set_style(e, "width", "30px")
        },
        m(t, s) {
            insert(t, e, s),
            mount_component(n, e, null),
            a = !0
        },
        p(t, e) {
            const a = {};
            2 & e[0] && (a.img = item(t[43].type, t[43].tier, t[43].logic ? t[43].logic.class : 0, t[8](t[43].quality))),
            2 & e[0] && (a.stacks = t[43].stacks || (t[43].upgrade ? "+" + t[43].upgrade : "")),
            2 & e[0] && (a.border = t[9](t[43].quality)),
            2 & e[0] | 262144 & e[1] && (a.$$scope = {
                dirty: e,
                ctx: t
            }),
            n.$set(a)
        },
        i(t) {
            a || (transition_in(n.$$.fragment, t),
            a = !0)
        },
        o(t) {
            transition_out(n.$$.fragment, t),
            a = !1
        },
        d(t) {
            t && detach(e),
            destroy_component(n)
        }
    }
}
function create_each_block_4(t) {
    let e, n, a, s, r, i, o, l, c, d, p, u, m, f, g = longnum(t[40][1]) + "", h = t[40][0] + "", _ = t[40][2] + "", b = t[40][3] + "", k = ~~(t[40][3] / t[40][2] * 100) + "";
    return {
        c() {
            e = element("div"),
            n = element("span"),
            a = text(g),
            s = space(),
            r = text(h),
            i = element("small"),
            o = element("span"),
            l = text(_),
            c = text("/"),
            d = element("span"),
            p = text(b),
            u = space(),
            m = text(k),
            f = text("% Crit"),
            attr(n, "class", "textprimary"),
            attr(o, "class", "textwhite"),
            attr(d, "class", "textblue")
        },
        m(t, g) {
            insert(t, e, g),
            append(e, n),
            append(n, a),
            append(e, s),
            append(e, r),
            insert(t, i, g),
            append(i, o),
            append(o, l),
            append(i, c),
            append(i, d),
            append(d, p),
            append(i, u),
            append(i, m),
            append(i, f)
        },
        p(t, e) {
            2 & e[0] && g !== (g = longnum(t[40][1]) + "") && set_data(a, g),
            2 & e[0] && h !== (h = t[40][0] + "") && set_data(r, h),
            2 & e[0] && _ !== (_ = t[40][2] + "") && set_data(l, _),
            2 & e[0] && b !== (b = t[40][3] + "") && set_data(p, b),
            2 & e[0] && k !== (k = ~~(t[40][3] / t[40][2] * 100) + "") && set_data(m, k)
        },
        d(t) {
            t && detach(e),
            t && detach(i)
        }
    }
}
function create_each_block_3(t) {
    let e, n, a, s, r, i, o, l, c, d, p, u, m, f, g, h, _, b = longnum(t[32][1]) + "", k = t[32][0] + "", y = longnum(t[32][2]) + "", v = t[32][3] + "", x = t[32][4] + "", w = ~~(t[32][4] / t[32][3] * 100) + "";
    return {
        c() {
            e = element("div"),
            n = element("span"),
            a = text(b),
            s = space(),
            r = text(k),
            i = element("small"),
            o = element("span"),
            l = text(y),
            c = text(" OH | "),
            d = element("span"),
            p = text(v),
            u = text("/"),
            m = element("span"),
            f = text(x),
            g = space(),
            h = text(w),
            _ = text("% Crit"),
            attr(n, "class", "textprimary"),
            attr(o, "class", "textblue"),
            attr(d, "class", "textwhite"),
            attr(m, "class", "textblue")
        },
        m(t, b) {
            insert(t, e, b),
            append(e, n),
            append(n, a),
            append(e, s),
            append(e, r),
            insert(t, i, b),
            append(i, o),
            append(o, l),
            append(i, c),
            append(i, d),
            append(d, p),
            append(i, u),
            append(i, m),
            append(m, f),
            append(i, g),
            append(i, h),
            append(i, _)
        },
        p(t, e) {
            2 & e[0] && b !== (b = longnum(t[32][1]) + "") && set_data(a, b),
            2 & e[0] && k !== (k = t[32][0] + "") && set_data(r, k),
            2 & e[0] && y !== (y = longnum(t[32][2]) + "") && set_data(l, y),
            2 & e[0] && v !== (v = t[32][3] + "") && set_data(p, v),
            2 & e[0] && x !== (x = t[32][4] + "") && set_data(f, x),
            2 & e[0] && w !== (w = ~~(t[32][4] / t[32][3] * 100) + "") && set_data(h, w)
        },
        d(t) {
            t && detach(e),
            t && detach(i)
        }
    }
}
function create_each_block_2(t) {
    let e, n, a, s, r, i = t[35][1] + "", o = t[35][0] + "";
    return {
        c() {
            e = element("div"),
            n = element("span"),
            a = text(i),
            s = text(" x "),
            r = text(o),
            attr(n, "class", "textprimary")
        },
        m(t, i) {
            insert(t, e, i),
            append(e, n),
            append(n, a),
            append(e, s),
            append(e, r)
        },
        p(t, e) {
            2 & e[0] && i !== (i = t[35][1] + "") && set_data(a, i),
            2 & e[0] && o !== (o = t[35][0] + "") && set_data(r, o)
        },
        d(t) {
            t && detach(e)
        }
    }
}
function create_each_block_1(t) {
    let e, n, a, s, r, i, o, l, c, d, p, u, m, f, g, h, _, b = longnum(t[32][1]) + "", k = t[32][0] + "", y = longnum(t[32][2]) + "", v = t[32][3] + "", x = t[32][4] + "", w = ~~(t[32][4] / t[32][3] * 100) + "";
    return {
        c() {
            e = element("div"),
            n = element("span"),
            a = text(b),
            s = space(),
            r = text(k),
            i = element("small"),
            o = element("span"),
            l = text(y),
            c = text(" MIT | "),
            d = element("span"),
            p = text(v),
            u = text("/"),
            m = element("span"),
            f = text(x),
            g = space(),
            h = text(w),
            _ = text("% Block"),
            attr(n, "class", "textprimary"),
            attr(o, "class", "textblue"),
            attr(d, "class", "textwhite"),
            attr(m, "class", "textblue")
        },
        m(t, b) {
            insert(t, e, b),
            append(e, n),
            append(n, a),
            append(e, s),
            append(e, r),
            insert(t, i, b),
            append(i, o),
            append(o, l),
            append(i, c),
            append(i, d),
            append(d, p),
            append(i, u),
            append(i, m),
            append(m, f),
            append(i, g),
            append(i, h),
            append(i, _)
        },
        p(t, e) {
            2 & e[0] && b !== (b = longnum(t[32][1]) + "") && set_data(a, b),
            2 & e[0] && k !== (k = t[32][0] + "") && set_data(r, k),
            2 & e[0] && y !== (y = longnum(t[32][2]) + "") && set_data(l, y),
            2 & e[0] && v !== (v = t[32][3] + "") && set_data(p, v),
            2 & e[0] && x !== (x = t[32][4] + "") && set_data(f, x),
            2 & e[0] && w !== (w = ~~(t[32][4] / t[32][3] * 100) + "") && set_data(h, w)
        },
        d(t) {
            t && detach(e),
            t && detach(i)
        }
    }
}
function create_each_block(t) {
    let e, n, a, s, r, i, o, l, c, d, p, u, m, f, g, h, _, b, k, y, v, x, w, S, $, I = t[29].patch + "", C = t[29].killid + "", L = dayjs(t[29].time).format("MMM DD") + "", B = t[29].gs + "", M = longnum(t[29][t[3] + "total"]) + "", U = longnum(t[29][t[3]]) + "", D = formatDurationDot(t[29].duration) + "";
    function E(...e) {
        return t[21](t[29], ...e)
    }
    return c = new Playertext({
        props: {
            name: t[29].name,
            pclass: t[29].class,
            level: t[29].level,
            faction: t[29].faction
        }
    }),
    p = new Bar({
        props: {
            right: longnum(t[29][t[6]]),
            fract: t[29][t[6]] / t[5][0][t[6]] * 100,
            barcol: "bgc" + t[29].class,
            size: "10",
            darken: !1
        }
    }),
    {
        c() {
            e = element("tr"),
            n = element("td"),
            a = text(I),
            s = element("td"),
            r = text(C),
            i = element("td"),
            o = text(L),
            l = element("td"),
            create_component(c.$$.fragment),
            d = element("td"),
            create_component(p.$$.fragment),
            u = element("td"),
            m = text(B),
            f = element("td"),
            g = text(M),
            _ = element("td"),
            b = text(U),
            y = element("td"),
            v = text(D),
            attr(n, "class", "textcenter hide1 textgrey svelte-m87by6"),
            attr(s, "class", "textcenter textgrey"),
            attr(i, "class", "textcenter hide3 svelte-m87by6"),
            attr(d, "class", "hide4 svelte-m87by6"),
            attr(u, "class", "textcenter hide2 textwhite} svelte-m87by6"),
            attr(f, "class", h = "textright text" + t[9](t[29]["perf" + t[3]]) + " svelte-m87by6"),
            attr(_, "class", k = "textright text" + t[9](t[29]["perf" + t[3]]) + " svelte-m87by6"),
            attr(y, "class", "textcenter"),
            attr(e, "class", x = "striped " + (t[29] === t[1] ? "selected" : ""))
        },
        m(t, h) {
            insert(t, e, h),
            append(e, n),
            append(n, a),
            append(e, s),
            append(s, r),
            append(e, i),
            append(i, o),
            append(e, l),
            mount_component(c, l, null),
            append(e, d),
            mount_component(p, d, null),
            append(e, u),
            append(u, m),
            append(e, f),
            append(f, g),
            append(e, _),
            append(_, b),
            append(e, y),
            append(y, v),
            w = !0,
            S || ($ = listen(e, "click", E),
            S = !0)
        },
        p(n, s) {
            t = n,
            (!w || 32 & s[0]) && I !== (I = t[29].patch + "") && set_data(a, I),
            (!w || 32 & s[0]) && C !== (C = t[29].killid + "") && set_data(r, C),
            (!w || 32 & s[0]) && L !== (L = dayjs(t[29].time).format("MMM DD") + "") && set_data(o, L);
            const i = {};
            32 & s[0] && (i.name = t[29].name),
            32 & s[0] && (i.pclass = t[29].class),
            32 & s[0] && (i.level = t[29].level),
            32 & s[0] && (i.faction = t[29].faction),
            c.$set(i);
            const l = {};
            96 & s[0] && (l.right = longnum(t[29][t[6]])),
            96 & s[0] && (l.fract = t[29][t[6]] / t[5][0][t[6]] * 100),
            32 & s[0] && (l.barcol = "bgc" + t[29].class),
            p.$set(l),
            (!w || 32 & s[0]) && B !== (B = t[29].gs + "") && set_data(m, B),
            (!w || 40 & s[0]) && M !== (M = longnum(t[29][t[3] + "total"]) + "") && set_data(g, M),
            (!w || 40 & s[0] && h !== (h = "textright text" + t[9](t[29]["perf" + t[3]]) + " svelte-m87by6")) && attr(f, "class", h),
            (!w || 40 & s[0]) && U !== (U = longnum(t[29][t[3]]) + "") && set_data(b, U),
            (!w || 40 & s[0] && k !== (k = "textright text" + t[9](t[29]["perf" + t[3]]) + " svelte-m87by6")) && attr(_, "class", k),
            (!w || 32 & s[0]) && D !== (D = formatDurationDot(t[29].duration) + "") && set_data(v, D),
            (!w || 34 & s[0] && x !== (x = "striped " + (t[29] === t[1] ? "selected" : ""))) && attr(e, "class", x)
        },
        i(t) {
            w || (transition_in(c.$$.fragment, t),
            transition_in(p.$$.fragment, t),
            w = !0)
        },
        o(t) {
            transition_out(c.$$.fragment, t),
            transition_out(p.$$.fragment, t),
            w = !1
        },
        d(t) {
            t && detach(e),
            destroy_component(c),
            destroy_component(p),
            S = !1,
            $()
        }
    }
}
function create_default_slot(t) {
    let e, n, a = t[7] && t[5] && create_if_block(t);
    return {
        c() {
            a && a.c(),
            e = empty()
        },
        m(t, s) {
            a && a.m(t, s),
            insert(t, e, s),
            n = !0
        },
        p(t, n) {
            t[7] && t[5] ? a ? (a.p(t, n),
            160 & n[0] && transition_in(a, 1)) : (a = create_if_block(t),
            a.c(),
            transition_in(a, 1),
            a.m(e.parentNode, e)) : a && (group_outros(),
            transition_out(a, 1, 1, ()=>{
                a = null
            }
            ),
            check_outros())
        },
        i(t) {
            n || (transition_in(a),
            n = !0)
        },
        o(t) {
            transition_out(a),
            n = !1
        },
        d(t) {
            a && a.d(t),
            t && detach(e)
        }
    }
}
function create_fragment(t) {
    let e, n;
    return e = new Layout({
        props: {
            $$slots: {
                default: [create_default_slot]
            },
            $$scope: {
                ctx: t
            }
        }
    }),
    {
        c() {
            create_component(e.$$.fragment)
        },
        m(t, a) {
            mount_component(e, t, a),
            n = !0
        },
        p(t, n) {
            const a = {};
            255 & n[0] | 262144 & n[1] && (a.$$scope = {
                dirty: n,
                ctx: t
            }),
            e.$set(a)
        },
        i(t) {
            n || (transition_in(e.$$.fragment, t),
            n = !0)
        },
        o(t) {
            transition_out(e.$$.fragment, t),
            n = !1
        },
        d(t) {
            destroy_component(e, t)
        }
    }
}
function instance(t, e, n) {
    let a;
    component_subscribe(t, hasloc, t=>n(7, a = t)),
    addMapping("shift", buttons.shift = {}),
    addMapping("ctrl", buttons.ctrl = {}),
    buttons.shift.store.set(!0);
    const s = new URLSearchParams(window.location.search)
      , r = ["grey", "green", "blue", "purp"]
      , i = t=>t >= 90 ? 3 : t >= 70 ? 2 : t >= 50 ? 1 : 0
      , o = t=>r[i(t)]
      , l = s.get("kill");
    let c, d, p, u, m = l ? parseInt(l) : void 0, f = parseInt(s.get("log")), g = "dps", h = "dps", _ = !1;
    const b = (t,e)=>{
        const n = [];
        for (let a = 0; a < t.length; a += e) {
            const s = loc.items.book[t[a]]
              , r = [s ? s.name : "?"];
            n.push(r);
            for (let n = 1; n < e; ++n)
                r.push(t[a + n])
        }
        return n.sort((t,e)=>e[1] - t[1]),
        n
    }
      , k = async()=>{
        _ = !0;
        try {
            n(5, u = await api("/api/pve/getbosskillplayerlogs", {
                classid: p,
                buildid: d,
                killid: m,
                sort: h
            })),
            u.forEach(t=>{
                t.parsedSkills = b(t.skills, 2),
                t.parsedDmg = b(t.dmg, 4),
                t.parsedHeal = b(t.heal, 5),
                t.parsedCasts = b(t.casts, 2),
                t.parsedMit = b(t.miti, 5),
                t.totalcasts = t.parsedCasts.reduce((t,e)=>t + ("Auto attack" !== e[0] ? e[1] : 0), 0),
                t.castps = t.totalcasts / t.active,
                t.items = [],
                t.id == f && n(1, c = t)
            }
            )
        } catch {
            n(5, u = [])
        }
        _ = !1
    }
    ;
    k();
    const y = t=>{
        _ || (n(6, h = t),
        k())
    }
      , v = ()=>{
        n(6, h = g),
        k()
    }
      , x = async t=>{
        if (0 === t.items.length) {
            const e = await fetch("/api/item/get", {
                method: "POST",
                body: JSON.stringify({
                    ids: t.equip
                })
            })
              , n = await e.json();
            !n.fail && Array.isArray(n) && n.sort((t,e)=>t.slot - e.slot).forEach(e=>{
                const n = new CoreItem(e.id);
                n.hydrate(e),
                t.items.push(n)
            }
            )
        }
        n(1, c = t)
    }
    ;
    function w() {
        g = select_value(this),
        n(3, g)
    }
    function S() {
        p = select_value(this),
        n(4, p)
    }
    function $() {
        m = to_number(this.value),
        n(0, m)
    }
    function I() {
        d = to_number(this.value),
        n(2, d)
    }
    const C = ()=>y(g + "total")
      , L = ()=>y(g)
      , B = ()=>y("duration")
      , M = (t,e)=>x(t);
    return [m, c, d, g, p, u, h, a, i, o, k, y, v, x, w, S, $, I, C, L, B, M]
}
class Component extends SvelteComponent {
    constructor(t) {
        super(),
        init(this, t, instance, create_fragment, safe_not_equal, {}, [-1, -1])
    }
}


module.exports.CoreItem = CoreItem