import pandas as pd
import tkinter as tk
from tkinter import filedialog, messagebox, ttk


class LibraryExcelApp:
    def __init__(self, root):
        self.root = root
        self.root.title("BELTEI Library - Excel Import/Export")
        self.root.geometry("700x400")

        # 1. ផ្ទុកទិន្នន័យបណ្តោះអាសន្ន
        self.books_data = pd.DataFrame(columns=["Title", "Author", "ISBN", "Category", "Copies", "Available"])

        # 2. បង្កើត Header & Frame
        title_label = tk.Label(root, text="គ្រប់គ្រងទិន្នន័យសៀវភៅតាម Excel", font=("Khmer OS Battambang", 14, "bold"))
        title_label.pack(pady=10)

        button_frame = tk.Frame(root)
        button_frame.pack(pady=5)

        # 3. ប៊ូតុង Import, Export & Print
        btn_import = tk.Button(
            button_frame,
            text="📥 Import Excel",
            command=self.import_excel,
            bg="#2b5c8f",
            fg="white",
            font=("sans-serif", 10, "bold"),
        )
        btn_import.pack(side=tk.LEFT, padx=5)

        btn_export = tk.Button(
            button_frame,
            text="📤 Export Excel",
            command=self.export_excel,
            bg="#2e7d32",
            fg="white",
            font=("sans-serif", 10, "bold"),
        )
        btn_export.pack(side=tk.LEFT, padx=5)

        btn_print = tk.Button(
            button_frame,
            text="🖨️ Print Data",
            command=self.print_data,
            bg="#424242",
            fg="white",
            font=("sans-serif", 10, "bold"),
        )
        btn_print.pack(side=tk.LEFT, padx=5)

        # 4. បង្កើត តារាងបង្ហាញទិន្នន័យ (Treeview)
        self.tree = ttk.Treeview(
            root,
            columns=("Title", "Author", "ISBN", "Category", "Copies", "Available"),
            show="headings",
        )

        for col in self.tree["columns"]:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=120, anchor=tk.W)

        self.tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    def import_excel(self):
        """ទាញយកទិន្នន័យពី File Excel ហើយបង្ហាញលើ តារាង"""
        file_path = filedialog.askopenfilename(filetypes=[("Excel Files", "*.xlsx *.xls")])
        if file_path:
            try:
                df = pd.read_excel(file_path)

                required_cols = ["Title", "Author", "ISBN", "Category", "Copies", "Available"]
                if not all(col in df.columns for col in required_cols):
                    messagebox.showerror(
                        "Error",
                        f"File ត្រូវតែមានជួរឈរ: {', '.join(required_cols)}",
                    )
                    return

                self.books_data = df[required_cols].copy()
                self.update_table()
                messagebox.showinfo("Success", "Import ទិន្នន័យជោគជ័យ!")
            except Exception as e:
                messagebox.showerror("Error", f"មិនអាចអាន File បានទេ: {str(e)}")

    def export_excel(self):
        """ទាញយកទិន្នន័យពីតារាង រក្សាទុកជា File Excel"""
        if self.books_data.empty:
            messagebox.showwarning("Warning", "គ្មានទិន្នន័យសម្រាប់ Export ទេ!")
            return

        file_path = filedialog.asksaveasfilename(defaultextension=".xlsx", filetypes=[("Excel Files", "*.xlsx")])
        if file_path:
            try:
                self.books_data.to_excel(file_path, index=False)
                messagebox.showinfo("Success", "Export ទិន្នន័យជា Excel ជោគជ័យ!")
            except Exception as e:
                messagebox.showerror("Error", f"មិនអាចរក្សាទុកបានទេ: {str(e)}")

    def print_data(self):
        """បោះពុម្ពទិន្នន័យទៅ Terminal / Console"""
        if self.books_data.empty:
            messagebox.showwarning("Warning", "គ្មានទិន្នន័យសម្រាប់ Print ទេ!")
        else:
            print("\n--- បញ្ជីសៀវភៅបោះពុម្ព ---")
            print(self.books_data.to_string(index=False))
            messagebox.showinfo("Print", "ទិន្នន័យត្រូវបានផ្ញើទៅកាន់ Console/Printer រួចរាល់!")

    def update_table(self):
        """ធ្វើបច្ចុប្បន្នភាពតារាង UI"""
        for row in self.tree.get_children():
            self.tree.delete(row)

        for _, row in self.books_data.iterrows():
            self.tree.insert("", tk.END, values=list(row))


if __name__ == "__main__":
    root = tk.Tk()
    app = LibraryExcelApp(root)
    root.mainloop()
