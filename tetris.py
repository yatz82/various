import random

# テトリミノ（ブロック）の形状と色を定義
SHAPES = [
    [[1, 1, 1, 1]],  # I
    [[1, 1], [1, 1]],  # O
    [[0, 1, 0], [1, 1, 1]],  # T
    [[1, 0, 0], [1, 1, 1]],  # L
    [[0, 0, 1], [1, 1, 1]],  # J
    [[0, 1, 1], [1, 1, 0]],  # S
    [[1, 1, 0], [0, 1, 1]],  # Z
]

SHAPE_COLORS = [
    (0, 255, 255),  # I (Cyan)
    (255, 255, 0),  # O (Yellow)
    (128, 0, 128),  # T (Purple)
    (255, 165, 0),  # L (Orange)
    (0, 0, 255),    # J (Blue)
    (0, 255, 0),    # S (Green)
    (255, 0, 0),    # Z (Red)
]

class TetrisGame:
    def __init__(self, width=10, height=20):
        self.width = width
        self.height = height
        self.board = [[0 for _ in range(width)] for _ in range(height)]
        self.score = 0
        self.game_over = False
        self.current_piece = None
        self.piece_x = 0
        self.piece_y = 0
        self.new_piece()

    def new_piece(self):
        """新しいテトリミノを生成する"""
        shape_index = random.randint(0, len(SHAPES) - 1)
        self.current_piece = {
            "shape": SHAPES[shape_index],
            "color_index": shape_index + 1, # 0は空のセルを表すため+1
            "rotation": 0,
        }
        self.piece_x = self.width // 2 - len(self.current_piece["shape"][0]) // 2
        self.piece_y = 0

        # 新しいピースが生成時に衝突する場合はゲームオーバー
        if self._check_collision(self.current_piece["shape"], (self.piece_x, self.piece_y)):
            self.game_over = True

    def _check_collision(self, shape, offset):
        """ピースが盤面や他のブロックと衝突するかチェックする"""
        off_x, off_y = offset
        for y, row in enumerate(shape):
            for x, cell in enumerate(row):
                if cell:
                    board_y = y + off_y
                    board_x = x + off_x
                    if (
                        board_x < 0 or
                        board_x >= self.width or
                        board_y >= self.height or
                        (board_y >= 0 and self.board[board_y][board_x])
                    ):
                        return True
        return False

    def move(self, dx):
        """ピースを左右に移動する"""
        if self.game_over:
            return
        new_x = self.piece_x + dx
        if not self._check_collision(self.current_piece["shape"], (new_x, self.piece_y)):
            self.piece_x = new_x

    def drop(self):
        """ピースを一番下まで落下させる（ハードドロップ）"""
        if self.game_over:
            return
        while not self._check_collision(self.current_piece["shape"], (self.piece_x, self.piece_y + 1)):
            self.piece_y += 1
        self._lock_piece()

    def step(self):
        """ピースを一段下に動かす"""
        if self.game_over:
            return False

        if not self._check_collision(self.current_piece["shape"], (self.piece_x, self.piece_y + 1)):
            self.piece_y += 1
            return True
        else:
            self._lock_piece()
            return False

    def rotate(self):
        """ピースを回転させる"""
        if self.game_over:
            return

        shape = self.current_piece["shape"]
        # 転置と反転を使って回転
        rotated_shape = [list(row) for row in zip(*shape[::-1])]

        # 壁キック（簡易版）
        if not self._check_collision(rotated_shape, (self.piece_x, self.piece_y)):
            self.current_piece["shape"] = rotated_shape
        # (簡易的な実装のため、複雑な壁キックは省略)

    def _lock_piece(self):
        """ピースを盤面に固定する"""
        shape = self.current_piece["shape"]
        for y, row in enumerate(shape):
            for x, cell in enumerate(row):
                if cell:
                    board_y = y + self.piece_y
                    board_x = x + self.piece_x
                    if 0 <= board_y < self.height and 0 <= board_x < self.width:
                        self.board[board_y][board_x] = self.current_piece["color_index"]

        self._clear_lines()
        self.new_piece()

    def _clear_lines(self):
        """揃ったラインを消去し、スコアを加算する"""
        lines_to_clear = []
        for i, row in enumerate(self.board):
            if all(row):
                lines_to_clear.append(i)

        if lines_to_clear:
            # スコア加算（例：1行100点、2行300点...）
            self.score += [0, 100, 300, 500, 800][len(lines_to_clear)]

            # ラインを削除
            for line_index in lines_to_clear:
                del self.board[line_index]
                self.board.insert(0, [0 for _ in range(self.width)])

    def get_board_state(self):
        """描画用の盤面状態を返す"""
        # 盤面のコピーを作成
        board_copy = [row[:] for row in self.board]

        # 現在のピースを盤面に描画
        if self.current_piece and not self.game_over:
            shape = self.current_piece["shape"]
            for y, row in enumerate(shape):
                for x, cell in enumerate(row):
                    if cell:
                        board_y = y + self.piece_y
                        board_x = x + self.piece_x
                        if 0 <= board_y < self.height and 0 <= board_x < self.width:
                            board_copy[board_y][board_x] = self.current_piece["color_index"]
        return board_copy
