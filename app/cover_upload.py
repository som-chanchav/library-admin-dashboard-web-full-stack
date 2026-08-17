import customtkinter as ctk
from tkinter import filedialog
from PIL import Image


def build_cover_upload_widget(parent, width=140, height=200):
    """Create a simple cover uploader widget with a preview label and button."""
    image_label = ctk.CTkLabel(parent, width=width, height=height, text="No Image")
    image_label.pack(pady=(0, 8))

    def choose_image():
        file_path = filedialog.askopenfilename(
            title="Select a cover image",
            filetypes=[("Image files", "*.png *.jpg *.jpeg *.webp")],
        )

        if not file_path:
            return

        try:
            with Image.open(file_path) as img:
                resized_image = img.resize((width, height))
                preview_image = ctk.CTkImage(
                    light_image=resized_image,
                    dark_image=resized_image,
                    size=(width, height),
                )

            image_label.configure(image=preview_image, text="")
            image_label.image = preview_image
            image_label.selected_path = file_path
        except Exception as exc:
            image_label.configure(text=f"Unable to load image\n{exc}", image=None)
            image_label.image = None

    upload_button = ctk.CTkButton(parent, text="Upload Cover", command=choose_image)
    upload_button.pack()

    return image_label


if __name__ == "__main__":
    ctk.set_appearance_mode("dark")
    ctk.set_default_color_theme("dark-blue")

    root = ctk.CTk()
    root.title("Cover Upload")
    root.geometry("250x280")
    build_cover_upload_widget(root)
    root.mainloop()
