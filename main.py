import tkinter as tk
from tkinter import messagebox
import random
import time
import json

class DigitTypingTrainer:
    def __init__(self):
        self.digits = list("0123456789")
        self.performance_dict = self.load_performance_data() or {digit: {'time': 0, 'count': 0} for digit in self.digits}
        self.sequence_start_time = None
        self.current_digit_index = 0
        self.total_chars = 0
        self.correct_count = 0

    def generate_digit_sequence(self, sequence_length):
        # Algorytm generowania ciągu cyfr
        sorted_digits = sorted(self.performance_dict.keys(), key=lambda x: self.performance_dict[x]['time'], reverse=True)

        # Prawdopodobieństwo wyboru cyfry rośnie wraz z jej czasem wpisywania
        probability_weights = [i + 1 for i in range(len(sorted_digits))]

        chosen_digits = random.choices(sorted_digits, weights=probability_weights, k=sequence_length)
        return chosen_digits

    def measure_typing_speed(self, digit, user_input):
        correct_count = 1 if user_input == digit else 0
        total_time = time.time() - self.sequence_start_time

        wpm = 0
        if total_time > 0:
            wpm = (self.total_chars / 5) / (total_time / 60)  # Assuming 5 characters per word

        accuracy = correct_count * 100

        return wpm, accuracy

    def update_performance_dict(self, digit, elapsed_time):
        if digit in self.performance_dict:
            self.performance_dict[digit]['count'] += 1
            self.performance_dict[digit]['time'] = (self.performance_dict[digit]['time'] + elapsed_time) / 2
        else:
            self.performance_dict[digit] = {'count': 1, 'time': elapsed_time}

    def save_performance_data(self):
        with open('performance_data.json', 'w') as file:
            json.dump(self.performance_dict, file)

    def load_performance_data(self):
        try:
            with open('performance_data.json', 'r') as file:
                return json.load(file)
        except FileNotFoundError:
            return None

class DigitTypingTrainerGUI(tk.Tk):
    def __init__(self, trainer):
        super().__init__()
        self.title("Digit Typing Trainer")
        self.geometry("400x200")

        self.trainer = trainer
        self.digit_sequence = []
        self.first_keypress = True

        self.label = tk.Label(self, text="Type the sequence of digits:")
        self.label.pack(pady=10)

        self.sequence_label = tk.Label(self, text="", font=("Arial", 14))
        self.sequence_label.pack(pady=5)

        self.entry_var = tk.StringVar()
        self.entry = tk.Entry(self, textvariable=self.entry_var)
        self.entry.pack(pady=10)
        self.entry.bind("<Key>", self.start_typing)

        self.start_new_round()  # Wywołanie automatyczne, aby wyświetlić sekwencję od samego początku

    def start_new_round(self):
        self.trainer.total_chars = 0  # Zerowanie liczby wpisanych znaków
        self.trainer.correct_count = 0  # Zerowanie liczby poprawnych znaków
        self.trainer.sequence_start_time = time.time()
        self.digit_sequence = self.trainer.generate_digit_sequence(10)
        self.trainer.current_digit_index = 0
        self.update_sequence_label()

    def update_sequence_label(self):
        self.sequence_label.config(text=f"Sequence: {' '.join(self.digit_sequence)}")
        self.label.config(text="Type the current digit:")

    def start_typing(self, event):
        if self.first_keypress:
            self.first_keypress = False

        user_input = self.entry_var.get()
        if len(user_input) == 1:
            elapsed_time = time.time() - self.trainer.sequence_start_time
            self.trainer.total_chars += 1
            wpm, accuracy = self.trainer.measure_typing_speed(self.digit_sequence[self.trainer.current_digit_index], user_input)
            self.trainer.update_performance_dict(self.digit_sequence[self.trainer.current_digit_index], elapsed_time)

            if accuracy == 100:
                self.trainer.correct_count += 1

            self.entry_var.set("")

            if self.trainer.current_digit_index < len(self.digit_sequence) - 1:
                self.trainer.current_digit_index += 1
                self.update_sequence_label()
            else:
                self.first_keypress = True
                self.show_typing_results()

    def show_typing_results(self):
        total_time = time.time() - self.trainer.sequence_start_time
        wpm = (self.trainer.total_chars / 5) / (total_time / 60) if total_time > 0 else 0
        accuracy = (self.trainer.correct_count / self.trainer.total_chars) * 100 if self.trainer.total_chars > 0 else 0

        messagebox.showinfo("Typing Results", f"Typing speed: {wpm:.2f} WPM\nAccuracy: {accuracy:.2f}%")
        self.trainer.save_performance_data()
        self.start_new_round()

if __name__ == "__main__":
    trainer = DigitTypingTrainer()
    app = DigitTypingTrainerGUI(trainer)
    app.mainloop()
