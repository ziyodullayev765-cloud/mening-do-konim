import os
import json
import logging
import asyncio
import threading

from flask import Flask, jsonify, send_from_directory, request
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler,
    MessageHandler, ConversationHandler, ContextTypes, filters,
)

# ====== SOZLAMALAR ======
BOT_TOKEN = "8548723883:AAEioNhbLfBVNgahk-DUMGWiFERdoP_Eee0"
ADMIN_CHAT_ID = 5995017557  # raqam sifatida (matn emas!)

# Mini App / webhook manzili. Render'da deploy qilgandan keyin "Settings > Environment"
# bo'limida WEBAPP_URL nomli muhit o'zgaruvchisi qo'shasiz, masalan:
# WEBAPP_URL = "https://mening-dokonim.onrender.com"
WEBAPP_URL = os.environ.get("WEBAPP_URL", "https://PLACEHOLDER.onrender.com")
PORT = int(os.environ.get("PORT", 8080))
WEBHOOK_PATH = f"/webhook/{BOT_TOKEN}"
# ====== SOZLAMALAR TUGADI ======

logging.basicConfig(format="%(asctime)s - %(levelname)s - %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

PRODUCTS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "products.json")

DEFAULT_PRODUCTS = [
    {"id": "p1", "name": "Klassik Futbolka", "price": 120000, "desc": "100% paxta, oq rang.", "emoji": "👕"},
    {"id": "p2", "name": "Sport Krossovka", "price": 350000, "desc": "Yengil va qulay.", "emoji": "👟"},
    {"id": "p3", "name": "Kepka", "price": 60000, "desc": "Quyoshdan himoya, qora rang.", "emoji": "🧢"},
]


def load_products():
    if not os.path.exists(PRODUCTS_FILE):
        save_products(DEFAULT_PRODUCTS)
    with open(PRODUCTS_FILE, encoding="utf-8") as f:
        return json.load(f)


def save_products(products):
    with open(PRODUCTS_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)


def is_admin(user_id: int) -> bool:
    return user_id == ADMIN_CHAT_ID


# =====================================================================
# WEB SERVER (Mini App sahifasi va mahsulotlar API'si)
# =====================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
flask_app = Flask(__name__)


@flask_app.route("/")
def serve_index():
    return send_from_directory(BASE_DIR, "index.html")


@flask_app.route("/api/products")
def api_products():
    return jsonify(load_products())


@flask_app.route(WEBHOOK_PATH, methods=["POST"])
def telegram_webhook():
    """Telegram bu yerga yangi xabarlarni yuboradi."""
    update = Update.de_json(request.get_json(force=True), application.bot)
    asyncio.run_coroutine_threadsafe(application.process_update(update), bot_loop)
    return "ok"


def run_flask():
    flask_app.run(host="0.0.0.0", port=PORT, threaded=True)


# =====================================================================
# BOT — XARIDOR OQIMI
# =====================================================================
GETTING_NAME, GETTING_PHONE, GETTING_ADDRESS = range(3)
ADD_NAME, ADD_PRICE, ADD_DESC, ADD_EMOJI, EDIT_PRICE = range(3, 8)


def buyer_menu_keyboard():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🛍 Do'konni ochish", web_app=WebAppInfo(url=WEBAPP_URL))],
    ])


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "👋 Xush kelibsiz!\n\nQuyidagi tugmani bosib, do'konni ochishingiz mumkin.",
        reply_markup=buyer_menu_keyboard(),
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (
        "/start — botni qayta ishga tushirish\n"
        "/cancel — joriy amalni bekor qilish"
    )
    if is_admin(update.effective_user.id):
        text += "\n/admin — admin panel (mahsulotlarni boshqarish)"
    await update.message.reply_text(text)


async def webapp_data_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        data = json.loads(update.effective_message.web_app_data.data)
    except Exception as e:
        logger.error(f"Web App ma'lumotini o'qishda xato: {e}")
        await update.message.reply_text("❌ Xatolik yuz berdi, qaytadan urinib ko'ring.")
        return ConversationHandler.END

    items = data.get("items", [])
    if not items:
        await update.message.reply_text("🛒 Savat bo'sh edi.")
        return ConversationHandler.END

    context.user_data["order_items"] = items
    context.user_data["order_total"] = data.get("total", 0)

    await update.message.reply_text("✍️ Ismingizni kiriting:")
    return GETTING_NAME


async def get_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["name"] = update.message.text
    await update.message.reply_text("📞 Telefon raqamingizni kiriting (masalan: +998901234567):")
    return GETTING_PHONE


async def get_phone(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["phone"] = update.message.text
    await update.message.reply_text("📍 Yetkazib berish manzilini kiriting:")
    return GETTING_ADDRESS


async def get_address(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["address"] = update.message.text
    user_id = update.effective_user.id

    name = context.user_data["name"]
    phone = context.user_data["phone"]
    address = context.user_data["address"]
    items = context.user_data["order_items"]
    total = context.user_data["order_total"]

    order_lines = [f"• {i['name']} x{i['qty']}" for i in items]
    order_text = "\n".join(order_lines)

    summary = (
        "✅ *Buyurtmangiz qabul qilindi!*\n\n"
        f"👤 Ism: {name}\n📞 Tel: {phone}\n📍 Manzil: {address}\n\n"
        f"🛒 Buyurtma:\n{order_text}\n\n💰 Jami: {total:,} so'm\n\n"
        "Tez orada operatorimiz siz bilan bog'lanadi. Rahmat! 🙏"
    )
    await update.message.reply_text(summary, parse_mode="Markdown")

    admin_text = (
        "🆕 *Yangi buyurtma!*\n\n"
        f"👤 Ism: {name}\n📞 Tel: {phone}\n📍 Manzil: {address}\n🆔 User ID: {user_id}\n\n"
        f"🛒 Buyurtma:\n{order_text}\n\n💰 Jami: {total:,} so'm"
    )
    try:
        await context.bot.send_message(chat_id=ADMIN_CHAT_ID, text=admin_text, parse_mode="Markdown")
    except Exception as e:
        logger.error(f"Admin'ga xabar yuborishda xato: {e}")

    context.user_data.clear()
    return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data.clear()
    await update.message.reply_text("❌ Bekor qilindi.")
    return ConversationHandler.END


# =====================================================================
# BOT — ADMIN PANEL (faqat ADMIN_CHAT_ID uchun)
# =====================================================================

def admin_menu_keyboard():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("➕ Mahsulot qo'shish", callback_data="adm_add")],
        [InlineKeyboardButton("✏️ Narxni tahrirlash", callback_data="adm_editprice")],
        [InlineKeyboardButton("🗑 Mahsulotni o'chirish", callback_data="adm_delete")],
        [InlineKeyboardButton("📋 Ro'yxatni ko'rish", callback_data="adm_list")],
    ])


async def admin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("⛔ Bu buyruq faqat admin uchun.")
        return
    await update.message.reply_text("🛠 *Admin panel*", parse_mode="Markdown", reply_markup=admin_menu_keyboard())


async def admin_instant_actions(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """adm_list, adm_back, va delp_* — bularga matn javobi kerak emas, shu yerda hal bo'ladi."""
    query = update.callback_query
    await query.answer()
    if not is_admin(query.from_user.id):
        return
    data = query.data
    products = load_products()

    if data == "adm_list":
        if not products:
            text = "Mahsulotlar yo'q."
        else:
            text = "\n".join(f"`{p['id']}` {p['emoji']} {p['name']} — {p['price']:,} so'm" for p in products)
        await query.edit_message_text(text, parse_mode="Markdown", reply_markup=admin_menu_keyboard())

    elif data == "adm_back":
        await query.edit_message_text("🛠 *Admin panel*", parse_mode="Markdown", reply_markup=admin_menu_keyboard())

    elif data.startswith("delp_"):
        pid = data.split("_", 1)[1]
        products = [p for p in products if p["id"] != pid]
        save_products(products)
        await query.edit_message_text("✅ O'chirildi.", reply_markup=admin_menu_keyboard())


async def admin_delete_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    if not is_admin(query.from_user.id):
        return
    products = load_products()
    if not products:
        await query.edit_message_text("Mahsulot yo'q.", reply_markup=admin_menu_keyboard())
        return
    buttons = [[InlineKeyboardButton(f"🗑 {p['name']}", callback_data=f"delp_{p['id']}")] for p in products]
    buttons.append([InlineKeyboardButton("⬅️ Orqaga", callback_data="adm_back")])
    await query.edit_message_text("Qaysi mahsulotni o'chirmoqchisiz?", reply_markup=InlineKeyboardMarkup(buttons))


# ---- Yangi mahsulot qo'shish (ketma-ket savollar) ----

async def admin_add_entry(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    if not is_admin(query.from_user.id):
        return ConversationHandler.END
    await query.edit_message_text("Yangi mahsulot nomini kiriting:")
    return ADD_NAME


async def admin_add_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["new_name"] = update.message.text
    await update.message.reply_text("Narxini kiriting (faqat raqam, masalan: 120000):")
    return ADD_PRICE


async def admin_add_price(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.replace(" ", "").replace(",", "")
    if not text.isdigit():
        await update.message.reply_text("Iltimos, faqat raqam kiriting (masalan: 120000):")
        return ADD_PRICE
    context.user_data["new_price"] = int(text)
    await update.message.reply_text("Qisqacha tavsifini kiriting:")
    return ADD_DESC


async def admin_add_desc(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["new_desc"] = update.message.text
    await update.message.reply_text("Mahsulot uchun bitta emoji yuboring (masalan: 👕):")
    return ADD_EMOJI


async def admin_add_emoji(update: Update, context: ContextTypes.DEFAULT_TYPE):
    products = load_products()
    existing_ids = {p["id"] for p in products}
    n = len(products) + 1
    new_id = f"p{n}"
    while new_id in existing_ids:
        n += 1
        new_id = f"p{n}"

    products.append({
        "id": new_id,
        "name": context.user_data["new_name"],
        "price": context.user_data["new_price"],
        "desc": context.user_data["new_desc"],
        "emoji": update.message.text.strip(),
    })
    save_products(products)
    await update.message.reply_text("✅ Mahsulot qo'shildi!", reply_markup=admin_menu_keyboard())
    context.user_data.clear()
    return ConversationHandler.END


# ---- Narxni tahrirlash ----

async def admin_editprice_entry(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    if not is_admin(query.from_user.id):
        return ConversationHandler.END
    products = load_products()
    if not products:
        await query.edit_message_text("Mahsulot yo'q.", reply_markup=admin_menu_keyboard())
        return ConversationHandler.END
    buttons = [[InlineKeyboardButton(f"{p['name']} ({p['price']:,} so'm)", callback_data=f"editp_{p['id']}")]
               for p in products]
    buttons.append([InlineKeyboardButton("⬅️ Orqaga", callback_data="adm_back")])
    await query.edit_message_text("Qaysi mahsulot narxini o'zgartirmoqchisiz?", reply_markup=InlineKeyboardMarkup(buttons))
    return ConversationHandler.END  # ro'yxat ko'rsatildi, keyingisi alohida conv bilan davom etadi


async def admin_editprice_select(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    if not is_admin(query.from_user.id):
        return ConversationHandler.END
    pid = query.data.split("_", 1)[1]
    context.user_data["edit_pid"] = pid
    await query.edit_message_text("Yangi narxni kiriting (faqat raqam, masalan: 150000):")
    return EDIT_PRICE


async def admin_editprice_save(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.replace(" ", "").replace(",", "")
    if not text.isdigit():
        await update.message.reply_text("Iltimos, faqat raqam kiriting:")
        return EDIT_PRICE
    pid = context.user_data.get("edit_pid")
    products = load_products()
    for p in products:
        if p["id"] == pid:
            p["price"] = int(text)
    save_products(products)
    await update.message.reply_text("✅ Narx yangilandi!", reply_markup=admin_menu_keyboard())
    context.user_data.clear()
    return ConversationHandler.END


async def admin_cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data.clear()
    await update.message.reply_text("❌ Bekor qilindi.")
    return ConversationHandler.END


# =====================================================================
# ASOSIY ISHGA TUSHIRISH
# =====================================================================

application = Application.builder().token(BOT_TOKEN).build()
bot_loop = asyncio.new_event_loop()


def build_handlers():
    # Xaridor buyurtma oqimi
    order_conv = ConversationHandler(
        entry_points=[MessageHandler(filters.StatusUpdate.WEB_APP_DATA, webapp_data_received)],
        states={
            GETTING_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_name)],
            GETTING_PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_phone)],
            GETTING_ADDRESS: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_address)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )

    # Admin: yangi mahsulot qo'shish oqimi
    add_conv = ConversationHandler(
        entry_points=[CallbackQueryHandler(admin_add_entry, pattern="^adm_add$")],
        states={
            ADD_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, admin_add_name)],
            ADD_PRICE: [MessageHandler(filters.TEXT & ~filters.COMMAND, admin_add_price)],
            ADD_DESC: [MessageHandler(filters.TEXT & ~filters.COMMAND, admin_add_desc)],
            ADD_EMOJI: [MessageHandler(filters.TEXT & ~filters.COMMAND, admin_add_emoji)],
        },
        fallbacks=[CommandHandler("cancel", admin_cancel)],
    )

    # Admin: narx tahrirlash oqimi
    editprice_conv = ConversationHandler(
        entry_points=[CallbackQueryHandler(admin_editprice_select, pattern="^editp_")],
        states={
            EDIT_PRICE: [MessageHandler(filters.TEXT & ~filters.COMMAND, admin_editprice_save)],
        },
        fallbacks=[CommandHandler("cancel", admin_cancel)],
    )

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("admin", admin_command))

    application.add_handler(order_conv)
    application.add_handler(add_conv)
    application.add_handler(editprice_conv)

    application.add_handler(CallbackQueryHandler(admin_delete_menu, pattern="^adm_delete$"))
    application.add_handler(CallbackQueryHandler(admin_editprice_entry, pattern="^adm_editprice$"))
    application.add_handler(CallbackQueryHandler(admin_instant_actions, pattern="^(adm_list|adm_back|delp_)"))


def start_bot_loop():
    """Bot uchun alohida, doimiy ishlaydigan asyncio loop'ni boshqa thread'da ishga tushiradi."""
    asyncio.set_event_loop(bot_loop)
    bot_loop.run_forever()


async def _init_and_set_webhook():
    build_handlers()
    await application.initialize()
    await application.start()
    webhook_url = WEBAPP_URL.rstrip("/") + WEBHOOK_PATH
    await application.bot.set_webhook(webhook_url)
    logger.info(f"Webhook o'rnatildi: {webhook_url}")


if __name__ == "__main__":
    threading.Thread(target=start_bot_loop, daemon=True).start()
    asyncio.run_coroutine_threadsafe(_init_and_set_webhook(), bot_loop).result(timeout=30)
    logger.info("Server ishga tushdi...")
    run_flask()
